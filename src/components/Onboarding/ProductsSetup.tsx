import React, { useState, useEffect } from 'react'
import { Package, Plus, Edit, Trash2, ArrowRight, ArrowLeft, Upload, X } from 'lucide-react'
import { Card } from '../UI/Card'
import { Button } from '../UI/Button'
import { Input } from '../UI/Input'
import { useOnboarding } from '../../hooks/useOnboarding'
import { supabaseClient, uploadProductImage } from '../../lib/supabase'

interface Product {
  id?: string
  name: string
  description: string
  price: number
  category: string
  image_url?: string
}

const categories = [
  'Pizzas',
  'Hambúrgueres',
  'Lanches',
  'Pratos Principais',
  'Saladas',
  'Sobremesas',
  'Bebidas',
  'Outros'
]

export const ProductsSetup: React.FC = () => {
  const { restaurant, onboardingStatus, refetch } = useOnboarding()
  const [products, setProducts] = useState<Product[]>([])
  const [showModal, setShowModal] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [error, setError] = useState('')
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  const [formData, setFormData] = useState<Product>({
    name: '',
    description: '',
    price: 0,
    category: categories[0],
    image_url: '',
  })

  useEffect(() => {
    if (restaurant) {
      fetchProducts()
    }
  }, [restaurant])

  useEffect(() => {
    // Update image preview when editing a product
    if (editingProduct?.image_url) {
      setImagePreview(editingProduct.image_url)
    }
  }, [editingProduct])

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabaseClient
        .from('products')
        .select('*')
        .eq('restaurant_id', restaurant?.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setProducts(data || [])
    } catch (err: any) {
      console.error('Error fetching products:', err)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const value = e.target.type === 'number' ? parseFloat(e.target.value) || 0 : e.target.value
    setFormData({
      ...formData,
      [e.target.name]: value,
    })
  }

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Por favor, selecione apenas arquivos de imagem')
        return
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('A imagem deve ter no máximo 5MB')
        return
      }

      setSelectedImage(file)
      
      // Create preview
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
      setError('')
    }
  }

  const removeImage = () => {
    setSelectedImage(null)
    setImagePreview(null)
    setFormData({ ...formData, image_url: '' })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      let imageUrl = formData.image_url

      // Upload image if selected
      if (selectedImage) {
        setUploadingImage(true)
        const tempProductId = editingProduct?.id || `temp-${Date.now()}`
        imageUrl = await uploadProductImage(selectedImage, tempProductId)
        setUploadingImage(false)
      }

      const productData = {
        ...formData,
        image_url: imageUrl,
      }

      if (editingProduct?.id) {
        // Update existing product
        const { error } = await supabaseClient
          .from('products')
          .update(productData)
          .eq('id', editingProduct.id)

        if (error) throw error
      } else {
        // Create new product
        const { error } = await supabaseClient
          .from('products')
          .insert({
            restaurant_id: restaurant?.id,
            ...productData,
          })

        if (error) throw error
      }

      await fetchProducts()
      await refetch() // Update onboarding status
      setShowModal(false)
      setEditingProduct(null)
      setSelectedImage(null)
      setImagePreview(null)
      setFormData({
        name: '',
        description: '',
        price: 0,
        category: categories[0],
        image_url: '',
      })
    } catch (err: any) {
      setError(err.message || 'Erro ao salvar produto')
    } finally {
      setLoading(false)
      setUploadingImage(false)
    }
  }

  const handleEdit = (product: Product) => {
    setEditingProduct(product)
    setFormData(product)
    setSelectedImage(null)
    setImagePreview(product.image_url || null)
    setShowModal(true)
  }

  const handleDelete = async (productId: string) => {
    if (!confirm('Tem certeza que deseja excluir este produto?')) return

    try {
      const { error } = await supabaseClient
        .from('products')
        .delete()
        .eq('id', productId)

      if (error) throw error

      await fetchProducts()
      await refetch() // Update onboarding status
    } catch (err: any) {
      console.error('Error deleting product:', err)
    }
  }

  const openAddModal = () => {
    setEditingProduct(null)
    setSelectedImage(null)
    setImagePreview(null)
    setFormData({
      name: '',
      description: '',
      price: 0,
      category: categories[0],
      image_url: '',
    })
    setShowModal(true)
  }

  const handleContinue = async () => {
    await refetch() // Make sure onboarding status is updated
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Card>
        <div className="p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Package className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Monte seu Cardápio
            </h2>
            <p className="text-gray-600">
              Adicione pelo menos um produto para continuar
            </p>
          </div>

          {/* Add Product Button */}
          <div className="flex justify-center mb-8">
            <Button onClick={openAddModal} size="lg">
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Produto
            </Button>
          </div>

          {/* Products List */}
          {products.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              {products.map((product) => (
                <div key={product.id} className="border border-gray-200 rounded-lg overflow-hidden">
                  {/* Product Image */}
                  {product.image_url ? (
                    <div className="aspect-video relative">
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="aspect-video bg-gray-100 flex items-center justify-center">
                      <Package className="w-12 h-12 text-gray-400" />
                    </div>
                  )}
                  
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-gray-900">{product.name}</h3>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(product)}
                          className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(product.id!)}
                          className="p-1 text-red-600 hover:bg-red-50 rounded"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{product.description}</p>
                    <div className="flex justify-between items-center">
                      <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                        {product.category}
                      </span>
                      <span className="font-bold text-green-600">
                        R$ {product.price.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 mb-8">
              <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Nenhum produto adicionado
              </h3>
              <p className="text-gray-600 mb-4">
                Adicione pelo menos um produto para continuar
              </p>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between pt-6 border-t border-gray-200">
            <Button variant="outline" size="lg">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
            
            {products.length > 0 && (
              <Button onClick={handleContinue} size="lg">
                <span>Continuar</span>
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Product Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              {editingProduct ? 'Editar Produto' : 'Adicionar Produto'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Imagem do Produto
                </label>
                
                {imagePreview ? (
                  <div className="relative">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-48 object-cover rounded-lg border border-gray-300"
                    />
                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600 mb-2">
                      Clique para adicionar uma imagem
                    </p>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageSelect}
                      className="hidden"
                      id="image-upload"
                    />
                    <label
                      htmlFor="image-upload"
                      className="cursor-pointer bg-blue-50 text-blue-600 px-4 py-2 rounded-lg text-sm hover:bg-blue-100"
                    >
                      Escolher Arquivo
                    </label>
                    <p className="text-xs text-gray-500 mt-2">
                      PNG, JPG até 5MB
                    </p>
                  </div>
                )}
              </div>

              <Input
                label="Nome do produto *"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Ex: Pizza Margherita"
                required
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descrição
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Descreva o produto..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Preço *"
                  name="price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.price}
                  onChange={handleChange}
                  placeholder="0.00"
                  required
                />

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Categoria *
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    required
                  >
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowModal(false)}
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  loading={loading || uploadingImage}
                  disabled={uploadingImage}
                >
                  {uploadingImage ? 'Enviando imagem...' : editingProduct ? 'Atualizar' : 'Adicionar'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}