import React, { useState } from 'react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Text,
  VStack,
  Progress,
  useToast,
  Alert,
  AlertIcon,
  HStack,
  CloseButton
} from '@chakra-ui/react';
import { AttachmentIcon } from '@chakra-ui/icons';
import axios from 'axios';

const CsvUploader = ({ onUploadSuccess }) => {
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState('');
  const toast = useToast();

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type !== 'text/csv') {
      setError('Please select a valid CSV file.');
      setFile(null);
      return;
    }
    setFile(selectedFile);
    setError('');
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a CSV file first.');
      return;
    }

    const formData = new FormData();
    formData.append('csvFile', file);  // Appending file under the key 'csvFile'

    try {
      setIsUploading(true);
      setError('');
      
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/csv/upload`, 
        formData, 
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setUploadProgress(percentCompleted);
          },
        }
      );      

      if (response.data.message === 'CSV uploaded and processed successfully') {
        setFile(null);
        setUploadProgress(0);
        onUploadSuccess();
        toast({
          title: 'Upload Successful',
          description: 'Your CSV file has been successfully uploaded and processed.',
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error('Error uploading CSV:', error);
      
      setError(
        error.response?.data?.message || 
        'Failed to upload CSV. Please try again.'
      );
      
      toast({
        title: 'Upload Failed',
        description: error.response?.data?.message || 'Failed to upload CSV. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Box p={4} borderWidth="1px" borderRadius="lg" bg="white" shadow="sm">
      <VStack spacing={4} align="stretch">
        <Text fontWeight="bold" fontSize="lg">Upload CSV File</Text>
        
        {error && (
          <Alert status="error" borderRadius="md">
            <AlertIcon />
            <Text flex="1">{error}</Text>
            <CloseButton onClick={() => setError('')} />
          </Alert>
        )}
        
        <FormControl>
          <FormLabel>Select CSV File</FormLabel>
          <Input
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            disabled={isUploading}
            p={1}
          />
        </FormControl>
        
        {file && (
          <Box>
            <Text fontSize="sm">
              Selected file: <Text as="span" fontWeight="medium">{file.name}</Text> ({(file.size / 1024).toFixed(2)} KB)
            </Text>
          </Box>
        )}
        
        {isUploading && (
          <Box>
            <Text mb={2}>Please wait while the file is being processed. Don't click multiple times. Thank you!😄</Text>
            <Progress value={uploadProgress} size="sm" colorScheme="blue" borderRadius="md" />
          </Box>
        )}
        
        <HStack justify="flex-end">
          <Button
            leftIcon={<AttachmentIcon />}
            colorScheme="blue"
            onClick={handleUpload}
            isLoading={isUploading}
            loadingText="Uploading..."
            disabled={!file || isUploading}
          >
            Upload CSV
          </Button>
        </HStack>
      </VStack>
    </Box>
  );
};

export default CsvUploader;
