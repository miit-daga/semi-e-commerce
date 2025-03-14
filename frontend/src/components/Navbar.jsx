import React from 'react';
import { Box, Flex, Heading, Button, Spacer } from '@chakra-ui/react';
import { AddIcon } from '@chakra-ui/icons';

const Navbar = ({ toggleUploader }) => {
  return (
    <Box bg="blue.600" px={4} py={3} shadow="md">
      <Flex align="center">
        <Heading size="md" color="white">Product Management System</Heading>
        <Spacer />
        <Button 
          leftIcon={<AddIcon />} 
          colorScheme="whiteAlpha" 
          variant="solid"
          onClick={toggleUploader}
        >
          Upload CSV
        </Button>
      </Flex>
    </Box>
  );
};

export default Navbar;