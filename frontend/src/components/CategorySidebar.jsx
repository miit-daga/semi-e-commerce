import React from 'react';
import { 
  Box, 
  VStack, 
  Heading, 
  Button, 
  Text, 
  Divider,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon
} from '@chakra-ui/react';

const CategorySidebar = ({ 
  categories, 
  subcategories,
  activeCategory,
  activeSubcategory,
  onCategoryClick,
  onSubcategoryClick
}) => {
  return (
    <Box 
      w="300px" 
      bg="gray.50" 
      p={4} 
      borderRight="1px" 
      borderColor="gray.200"
      h="calc(100vh - 60px)"
      overflowY="auto"
    >
      <Heading size="md" mb={4}>Categories</Heading>
      <Divider mb={4} />
      
      {categories.length === 0 ? (
        <Text color="gray.500">No categories found</Text>
      ) : (
        <Accordion allowToggle defaultIndex={activeCategory ? [0] : undefined}>
          {categories.map((category) => (
            <AccordionItem key={category.id} border="none">
              <AccordionButton 
                py={2}
                px={0}
                _hover={{ bg: 'blue.50' }}
                bg={activeCategory === category.id ? 'blue.50' : 'transparent'}
                onClick={() => onCategoryClick(category.id)}
                fontWeight={activeCategory === category.id ? "bold" : "normal"}
              >
                <Box flex="1" textAlign="left">
                  {category.name}
                </Box>
                <AccordionIcon />
              </AccordionButton>
              
              <AccordionPanel pb={4} px={0}>
                <VStack align="stretch" spacing={1}>
                  {subcategories
                    .filter(sub => sub.categoryId === category.id)
                    .map(subcategory => (
                      <Button
                        key={subcategory.id}
                        variant="ghost"
                        justifyContent="flex-start"
                        size="sm"
                        pl={4}
                        fontWeight={activeSubcategory === subcategory.id ? "bold" : "normal"}
                        bg={activeSubcategory === subcategory.id ? 'blue.100' : 'transparent'}
                        onClick={() => onSubcategoryClick(subcategory.id)}
                      >
                        {subcategory.name}
                      </Button>
                    ))}
                </VStack>
              </AccordionPanel>
            </AccordionItem>
          ))}
        </Accordion>
      )}
    </Box>
  );
};

export default CategorySidebar;