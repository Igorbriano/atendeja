import React, { useState, useEffect } from 'react'
import { Plus, Search, Edit, Trash2, Package, Upload, X } from 'lucide-react'
import { Card } from '../components/UI/Card'
import { Button } from '../components/UI/Button'
import { Input } from '../components/UI/Input'
import { useOnboarding } from '../hooks/useOnboarding'
import { supabaseClient, uploadProductImage } from '../lib/supabase'

interface Product {
  id: string
  name: string
  description: string
  price: number
  category_id?: string
  category?: { name: string }
  image_url?: string
  active: boolean
}

interface Category {
  id: string
  name: string
  description?: string
  active: boolean
}

export const Products: React.FC = () => {
  const { restaurant } = useOnboarding()
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('Todos')
  const [showModal, setShowModal] = useState(false)
  const [showCategoryModal, setShowCategoryModal] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [error, setError] = useState('')

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: 0,
    category_id: '',
    image_url: '',
    active: true,
  })

  const [categoryFormData, setCategoryFormData] = useState({
    name: '',
    description: '',
    active: true,
  })

  useEffect(() => {
    if (restaurant?.id) {
      fetchCategories()
      fetchProducts()
    } else {
      setLoading(false)
    }
  }, [restaurant])

  useEffect(() => {
    if (editingProduct?.image_url) {
      setImagePreview(editingProduct.image_url)
    }
  }, [editingProduct])

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabaseClient
        .from('categories')
        .select('*')
        .eq('restaurant_id', restaurant!.id)
        .eq('active', true)
        .order('name', { ascending: true })

      if (error) throw error
      setCategories(data || [])
    } catch (err: any) {
      console.error('Error fetching categories:', err)
    }
  }

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabaseClient
        .from('products')
        .select(`
          *,
          category:categories(name)
        `)
        .eq('restaurant_id', restaurant!.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setProducts(data || [])
    } catch (err: any) {
      console.error('Error fetching products:', err)
      setError('Erro ao carregar produtos')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const value = e.target.type === 'number' ? parseFloat(e.target.value) || 0 : e.target.value
    setFormData({
      ...formData,
      [e.target.name]: value,
    })
  }

  const handleCategoryChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setCategoryFormData({
      ...categoryFormData,
      [e.target.name]: e.target.value,
    })
  }

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('Por favor, selecione apenas arquivos de imagem')
        return
      }

      if (file.size > 5 * 1024 * 1024) {
        setError('A imagem deve ter no máximo 5MB')
        return
      }

      setSelectedImage(file)
      
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
    setSaving(true)
    setError('')

    try {
      let imageUrl = formData.image_url

      if (selectedImage) {
        setUploadingImage(true)
        const tempProductId = editingProduct?.id || `temp-${Date.now()}`
        imageUrl = await uploadProductImage(selectedImage, tempProductId)
        setUploadingImage(false)
      }

      const productData = {
        ...formData,
        image_url: imageUrl,
        restaurant_id: restaurant!.id,
      }

      if (editingProduct?.id) {
        const { error } = await supabaseClient
          .from('products')
          .update(productData)
          .eq('id', editingProduct.id)

        if (error) throw error
      } else {
        const { error } = await supabaseClient
          .from('products')
          .insert(productData)

        if (error) throw error
      }

      await fetchProducts()
      closeModal()
    } catch (err: any) {
      setError(err.message || 'Erro ao salvar produto')
    } finally {
      setSaving(false)
      setUploadingImage(false)
    }
  }

  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')

    try {
      const categoryData = {
        ...categoryFormData,
        restaurant_id: restaurant!.id,
      }

      if (editingCategory?.id) {
        const { error } = await supabaseClient
          .from('categories')
          .update(categoryData)
          .eq('id', editingCategory.id)

        if (error) throw error
      } else {
        const { error } = await supabaseClient
          .from('categories')
          .insert(categoryData)

        if (error) throw error
      }

      await fetchCategories()
      closeCategoryModal()
    } catch (err: any) {
      setError(err.message || 'Erro ao salvar categoria')
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = (product: Product) => {
    setEditingProduct(product)
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price,
      category_id: product.category_id || '',
      image_url: product.image_url || '',
      active: product.active,
    })
    setSelectedImage(null)
    setImagePreview(product.image_url || null)
    setShowModal(true)
  }

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category)
    setCategoryFormData({
      name: category.name,
      description: category.description || '',
      active: category.active,
    })
    setShowCategoryModal(true)
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
    } catch (err: any) {
      console.error('Error deleting product:', err)
      setError('Erro ao excluir produto')
    }
  }

  const handleDeleteCategory = async (categoryId: string) => {
    if (!confirm('Tem certeza que deseja excluir esta categoria? Produtos desta categoria ficarão sem categoria.')) return

    try {
      const { error } = await supabaseClient
        .from('categories')
        .delete()
        .eq('id', categoryId)

      if (error) throw error
      await fetchCategories()
      await fetchProducts()
    } catch (err: any) {
      console.error('Error deleting category:', err)
      setError('Erro ao excluir categoria')
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
      category_id: categories.length > 0 ? categories[0].id : '',
      image_url: '',
      active: true,
    })
    setShowModal(true)
  }

  const openAddCategoryModal = () => {
    setEditingCategory(null)
    setCategoryFormData({
      name: '',
      description: '',
      active: true,
    })
    setShowCategoryModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setEditingProduct(null)
    setSelectedImage(null)
    setImagePreview(null)
    setError('')
  }

  const closeCategoryModal = () => {
    setShowCategoryModal(false)
    setEditingCategory(null)
    setError('')
  }

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'Todos' || 
                           (product.category?.name === selectedCategory) ||
                           (selectedCategory === 'Sem categoria' && !product.category)
    return matchesSearch && matchesCategory
  })

  const categoryOptions = ['Todos', ...categories.map(cat => cat.name), 'Sem categoria']

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Produtos</h1>
          <p className="text-gray-600 mt-1">Gerencie o cardápio do seu restaurante</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={openAddCategoryModal} variant="outline">
            <Plus className="w-4 h-4 mr-2" />
            Nova Categoria
          </Button>
          <Button onClick={openAddModal}>
            <Plus className="w-4 h-4 mr-2" />
            Adicionar Produto
          </Button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Gerenciar Categorias */}
      {categories.length > 0 && (
        <Card title="Suas Categorias" subtitle="Gerencie as categorias do seu cardápio">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {categories.map((category) => (
              <div key={category.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900">{category.name}</h3>
                    {category.description && (
                      <p className="text-sm text-gray-600">{category.description}</p>
                    )}
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEditCategory(category)}
                      className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteCategory(category.id)}
                      className="p-1 text-red-600 hover:bg-red-50 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Filtros */}
      <Card>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar produtos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>
          <div className="flex gap-2 flex-wrap">
            {categoryOptions.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  selectedCategory === category
                    ? 'bg-green-100 text-green-700 border border-green-300'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Lista de Produtos */}
      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => (
            <Card key={product.id} className="overflow-hidden">
              <div className="aspect-video relative">
                {product.image_url ? (
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                    <Package className="w-12 h-12 text-gray-400" />
                  </div>
                )}
                <div className="absolute top-2 right-2">
                  <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                    product.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {product.active ? 'Ativo' : 'Inativo'}
                  </span>
                </div>
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-gray-900">{product.name}</h3>
                  <span className="text-lg font-bold text-green-600">
                    R$ {product.price.toFixed(2)}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-3">{product.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                    {product.category?.name || 'Sem categoria'}
                  </span>
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => handleEdit(product)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDelete(product.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="text-center py-12">
          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {products.length === 0 ? 'Nenhum produto cadastrado' : 'Nenhum produto encontrado'}
          </h3>
          <p className="text-gray-600 mb-4">
            {products.length === 0 
              ? 'Adicione produtos ao seu cardápio para começar a vender'
              : 'Tente ajustar os filtros de busca'
            }
          </p>
          {categories.length === 0 ? (
            <div className="space-y-2">
              <p className="text-sm text-orange-600 mb-4">
                💡 Primeiro, crie pelo menos uma categoria para organizar seus produtos
              </p>
              <Button onClick={openAddCategoryModal} variant="secondary">
                <Plus className="w-4 h-4 mr-2" />
                Criar Primeira Categoria
              </Button>
            </div>
          ) : (
            <Button onClick={openAddModal}>
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Produto
            </Button>
          )}
        </Card>
      )}

      {/* Modal para Adicionar/Editar Produto */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              {editingProduct ? 'Editar Produto' : 'Adicionar Produto'}
            </h2>
            
            {categories.length === 0 && (
              <div className="bg-orange-50 border border-orange-200 text-orange-800 px-4 py-3 rounded-lg text-sm mb-4">
                ⚠️ Você precisa criar pelo menos uma categoria antes de adicionar produtos.
                <button
                  onClick={() => {
                    closeModal()
                    openAddCategoryModal()
                  }}
                  className="ml-2 underline font-medium"
                >
                  Criar categoria agora
                </button>
              </div>
            )}
            
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
                    name="category_id"
                    value={formData.category_id}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    required
                    disabled={categories.length === 0}
                  >
                    <option value="">Selecione uma categoria</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="active"
                  name="active"
                  checked={formData.active}
                  onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                  className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                />
                <label htmlFor="active" className="ml-2 text-sm text-gray-700">
                  Produto ativo
                </label>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={closeModal}
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  loading={saving || uploadingImage}
                  disabled={uploadingImage || categories.length === 0}
                >
                  {uploadingImage ? 'Enviando imagem...' : saving ? 'Salvando...' : editingProduct ? 'Atualizar' : 'Adicionar'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal para Adicionar/Editar Categoria */}
      {showCategoryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              {editingCategory ? 'Editar Categoria' : 'Nova Categoria'}
            </h2>
            
            <form onSubmit={handleCategorySubmit} className="space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <Input
                label="Nome da categoria *"
                name="name"
                value={categoryFormData.name}
                onChange={handleCategoryChange}
                placeholder="Ex: Pizzas, Bebidas, Sobremesas"
                required
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descrição (opcional)
                </label>
                <textarea
                  name="description"
                  value={categoryFormData.description}
                  onChange={handleCategoryChange}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Descreva a categoria..."
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="category-active"
                  name="active"
                  checked={categoryFormData.active}
                  onChange={(e) => setCategoryFormData({ ...categoryFormData, active: e.target.checked })}
                  className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                />
                <label htmlFor="category-active" className="ml-2 text-sm text-gray-700">
                  Categoria ativa
                </label>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={closeCategoryModal}
                >
                  Cancelar
                </Button>
                <Button type="submit" loading={saving}>
                  {editingCategory ? 'Atualizar' : 'Criar'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}