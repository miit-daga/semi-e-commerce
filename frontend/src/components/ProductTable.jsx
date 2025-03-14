import React, { useMemo } from 'react';
import {
  Box,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Link,
  Text,
  Tooltip,
  Badge,
  Heading
} from '@chakra-ui/react';
import { ExternalLinkIcon } from '@chakra-ui/icons';

const ProductTable = ({ products }) => {
  const specificationFields = useMemo(() => {
    if (!products || products.length === 0) return [];
    
    const specs = products[0].specifications;
    return Object.keys(specs)
      .filter(key => !key.startsWith('has') && key !== 'id' && key !== 'partId');
  }, [products]);

  const categoryInfo = useMemo(() => {
    if (!products || products.length === 0) return { category: '', subcategory: '' };
    
    return {
      category: products[0].subCategory.category.name,
      subcategory: products[0].subCategory.name
    };
  }, [products]);

  const renderCellValue = (product, field) => {
    const value = product.specifications[field];
    const hasField = product.specifications[`has${field.charAt(0).toUpperCase() + field.slice(1)}`];
    
    if (value !== null) {
      return value;
    } else if (hasField) {
      return "-"; 
    } else {
      return "NA";
    }
  };

  const formatFieldName = (field) => {
    if (field === 'vdss') return 'VDSS';
    if (field === 'vgs') return 'VGS';
    if (field === 'vthMin') return 'VTH Min';
    if (field === 'vthMax') return 'VTH Max';
    if (field === 'idAt25') return 'ID @ 25°C';
    if (field === 'vthMaxValue') return 'VTH Max Value';
    if (field === 'ron4_5v') return 'RON @ 4.5V';
    if (field === 'ron10v') return 'RON @ 10V';
    
    return field
      .replace(/_/g, ' ')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <Box>
      <Box mb={4}>
        <Heading size="md">{categoryInfo.category}</Heading>
        <Text color="gray.600">
          <Badge colorScheme="blue" mr={2}>{categoryInfo.subcategory}</Badge>
          {products.length} {products.length === 1 ? 'product' : 'products'}
        </Text>
      </Box>
      
      <Box overflowX="auto">
        <Table variant="simple" size="sm" borderWidth="1px" borderRadius="md">
          <Thead bg="gray.50">
            <Tr>
              <Th>Part Number</Th>
              <Th>Datasheet</Th>
              {specificationFields.map(field => (
                <Th key={field}>{formatFieldName(field)}</Th>
              ))}
            </Tr>
          </Thead>
          <Tbody>
            {products.map(product => (
              <Tr key={product.id}>
                <Td fontWeight="medium">{product.partNumber}</Td>
                <Td>
                  {product.datasheetLink ? (
                    <Link 
                      href={product.datasheetLink} 
                      isExternal
                      color="blue.500"
                      display="flex"
                      alignItems="center"
                    >
                      View <ExternalLinkIcon mx="2px" />
                    </Link>
                  ) : (
                    <Text color="gray.400">-</Text>
                  )}
                </Td>
                {specificationFields.map(field => (
                  <Td key={field}>
                    {renderCellValue(product, field)}
                  </Td>
                ))}
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Box>
    </Box>
  );
};

export default ProductTable;