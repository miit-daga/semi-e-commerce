import React, { useState, useEffect } from 'react';
import { ChakraProvider, Box, Flex, Heading, Spinner, Text, useToast } from '@chakra-ui/react';
import axios from 'axios';
import Navbar from './components/Navbar';
import CategorySidebar from './components/CategorySidebar';
import ProductTable from './components/ProductTable';
import CsvUploader from './components/CsvUploader';

function App() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeCategory, setActiveCategory] = useState(null);
  const [activeSubcategory, setActiveSubcategory] = useState(null);
  const [showUploader, setShowUploader] = useState(false);
  const toast = useToast();

  // Function to fetch all products and extract categories
  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/products`);
      
      // Extract unique categories from products
      const categoriesMap = new Map();
      response.data.forEach(product => {
        const category = product.subCategory.category;
        if (!categoriesMap.has(category.name)) {
          categoriesMap.set(category.name, {
            id: category.id,
            name: category.name
          });
        }
      });
      
      setCategories(Array.from(categoriesMap.values()));
      setLoading(false);
    } catch (error) {
      console.error('Error fetching initial data:', error);
      toast({
        title: 'Error fetching data',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      setLoading(false);
    }
  };

  // Function to fetch subcategories when a category is selected
  const fetchSubcategories = async (categoryName) => {
    if (!categoryName) return;
    
    try {
      setLoading(true);
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/products?category=${categoryName}`);

    
      const subcategoriesMap = new Map();
      response.data.forEach(product => {
        const subcategory = product.subCategory;
        if (!subcategoriesMap.has(subcategory.name)) {
          subcategoriesMap.set(subcategory.name, {
            id: subcategory.id,
            name: subcategory.name,
            categoryId: subcategory.categoryId
          });
        }
      });
      
      setSubcategories(Array.from(subcategoriesMap.values()));
      setProducts([]);
      setActiveSubcategory(null);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching subcategories:', error);
      toast({
        title: 'Error fetching subcategories',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      setLoading(false);
    }
  };

  // Function to fetch products by subcategory
  const fetchProductsBySubcategory = async (subcategoryName) => {
    if (!subcategoryName) return;
    
    try {
      setLoading(true);
      // Use the subcategory name for the API call
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/products?subcategory=${subcategoryName}`);
      setProducts(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast({
        title: 'Error fetching products',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (activeCategory) {
      // Find the category name from the active category ID
      const category = categories.find(cat => cat.id === activeCategory);
      if (category) {
        fetchSubcategories(category.name);
      }
    }
  }, [activeCategory, categories]);


  useEffect(() => {
    if (activeSubcategory) {
      const subcategory = subcategories.find(sub => sub.id === activeSubcategory);
      if (subcategory) {
        fetchProductsBySubcategory(subcategory.name);
      }
    }
  }, [activeSubcategory, subcategories]);

  const handleCategoryClick = (categoryId) => {
    setActiveCategory(categoryId);
  };

  const handleSubcategoryClick = (subcategoryId) => {
    setActiveSubcategory(subcategoryId);
  };

  const toggleUploader = () => {
    setShowUploader(!showUploader);
  };

  return (
    <ChakraProvider>
      <Box minH="100vh">
        <Navbar toggleUploader={toggleUploader} />
        
        {showUploader && (
          <Box p={4} bg="gray.50">
            <CsvUploader 
              onUploadSuccess={() => {
                fetchInitialData();
                setShowUploader(false);
                toast({
                  title: 'Success',
                  description: 'CSV uploaded and processed successfully',
                  status: 'success',
                  duration: 5000,
                  isClosable: true,
                });
              }}
            />
          </Box>
        )}
        
        <Flex>
          <CategorySidebar 
            categories={categories} 
            subcategories={subcategories} 
            activeCategory={activeCategory}
            activeSubcategory={activeSubcategory}
            onCategoryClick={handleCategoryClick}
            onSubcategoryClick={handleSubcategoryClick}
          />
          
          <Box flex="1" p={4}>
            {loading ? (
              <Flex direction="column" align="center" justify="center" h="300px">
                <Spinner size="xl" />
                <Text mt={4}>Loading data...</Text>
              </Flex>
            ) : products.length > 0 ? (
              <ProductTable products={products} />
            ) : (
              <Box textAlign="center" p={8}>
                <Heading size="md">
                  {activeCategory 
                    ? (activeSubcategory 
                      ? "No products found in this subcategory" 
                      : "Select a subcategory to view products")
                    : "Select a category to begin"}
                </Heading>
              </Box>
            )}
          </Box>
        </Flex>
      </Box>
    </ChakraProvider>
  );
}

export default App;