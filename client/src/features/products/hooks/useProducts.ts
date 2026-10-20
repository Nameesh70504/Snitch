import { useSelector, useDispatch } from 'react-redux'
import { useCallback, useEffect, useMemo } from 'react'
import {
  fetchProducts,
  setSelectedCategory,
  setSearchQuery,
  setSortBy,
  setSelectedProduct,
} from '../state/productSlice'
import type { RootState, Product } from '../../../types'
import type { AppDispatch } from '../../../app/store'

export const useProducts = (autoFetch = false, page = 1) => {
  const dispatch = useDispatch<AppDispatch>()
  const {
    items,
    totalPages,
    currentPage,
    isLoading,
    error,
    selectedCategory,
    searchQuery,
    sortBy,
    selectedProduct,
  } = useSelector((state: RootState) => state.products)

  useEffect(() => {
    if (autoFetch && items.length === 0 && !isLoading) {
      dispatch(fetchProducts(page))
    }
  }, [dispatch, autoFetch, items.length, isLoading, page])

  const loadProducts = useCallback(
    (targetPage = 1) => dispatch(fetchProducts(targetPage)),
    [dispatch]
  )

  const changeCategory = useCallback(
    (category: string) => dispatch(setSelectedCategory(category)),
    [dispatch]
  )

  const changeSearchQuery = useCallback(
    (query: string) => dispatch(setSearchQuery(query)),
    [dispatch]
  )

  const changeSortBy = useCallback(
    (sort: 'featured' | 'price-asc' | 'price-desc') => dispatch(setSortBy(sort)),
    [dispatch]
  )

  const selectProduct = useCallback(
    (product: Product | null) => dispatch(setSelectedProduct(product)),
    [dispatch]
  )

  const filteredProducts = useMemo(() => {
    let result = [...items]

    if (selectedCategory && selectedCategory !== 'All') {
      result = result.filter((p) =>
        p.categories?.some((c) => c.toLowerCase() === selectedCategory.toLowerCase())
      )
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim()
      result = result.filter(
        (p) =>
          p.title?.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q) ||
          p.categories?.some((c) => c.toLowerCase().includes(q))
      )
    }

    if (sortBy === 'price-asc') {
      result.sort((a, b) => (a.price?.amount || 0) - (b.price?.amount || 0))
    } else if (sortBy === 'price-desc') {
      result.sort((a, b) => (b.price?.amount || 0) - (a.price?.amount || 0))
    }

    return result
  }, [items, selectedCategory, searchQuery, sortBy])

  const allCategories = useMemo(() => {
    const set = new Set<string>(['All'])
    items.forEach((p) => p.categories?.forEach((c) => set.add(c)))
    return Array.from(set)
  }, [items])

  return {
    products: filteredProducts,
    allProducts: items,
    totalPages,
    currentPage,
    isLoading,
    error,
    selectedCategory,
    searchQuery,
    sortBy,
    selectedProduct,
    allCategories,
    loadProducts,
    changeCategory,
    changeSearchQuery,
    changeSortBy,
    selectProduct,
  }
}
