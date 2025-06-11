import { IPrize } from "@/models/interfaces/IPrizeInterfaces";

const creatorPrizeAPIClient = {


    getAllPrizes: async () => {
        try {
          const response = await fetch('/api/creator/prizes');
          return response.json(); 
        } catch (error) {
          return {
            success: false,
            statusCode: 500,
            message: 'Erro ao comunicar com o servidor',
            error: error instanceof Error ? error.message : 'Erro desconhecido'
          };
        }
      },
    
      getPrizeById: async (id: string) => {
        try {
          const response = await fetch(`/api/creator/prizes/${id}`);
          return response.json();
        } catch (error) {
          return {
            success: false,
            statusCode: 500,
            message: 'Erro ao comunicar com o servidor',
            error: error instanceof Error ? error.message : 'Erro desconhecido'
          };
        }
      },
    
      deletePrize: async (id: string) => {
        try {
          const response = await fetch(`/api/creator/prizes/${id}`, {
            method: 'DELETE'
          });
          return response.json();
        } catch (error) {
          return {
            success: false,
            statusCode: 500,
            message: 'Erro ao comunicar com o servidor',  
            error: error instanceof Error ? error.message : 'Erro desconhecido'
          };
        }
      },
    
      updatePrize: async (id: string, updatedData: Partial<IPrize>, modifiedFields: string[]) => {
        try {
          // Create FormData for the update (for handling file uploads)
          const formData = new FormData();
          
          // Only include fields that have actually been modified
          modifiedFields.forEach(field => {
            if (field === 'image' || field === 'images') {
              // Handle file uploads specially
              const value = updatedData[field as keyof Partial<IPrize>];
              
              // Check if it's a File object
              if (value && typeof value === 'object' && 'name' in value && 'type' in value && 'size' in value) {
                formData.append(field, value as File);
              } else if (Array.isArray(value)) {
                // For image arrays, we need to handle both File arrays and string arrays
                value.forEach((item, index) => {
                  if (item && typeof item === 'object' && 'name' in item && 'type' in item && 'size' in item) {
                    formData.append(`${field}[${index}]`, item as File);
                  } else if (typeof item === 'string') {
                    // If it's a string URL that wasn't changed, we'll pass it as is
                    formData.append(`${field}[${index}]`, item);
                  }
                });
              } else if (typeof value === 'string') {
                // If the image is a string URL that wasn't changed
                formData.append(field, value);
              }
            } else if (field in updatedData) {
              // For normal fields, just add the value
              const value = updatedData[field as keyof Partial<IPrize>];
              if (value !== undefined) {
                formData.append(field, String(value));
              }
            }
          });
          
          // Add the list of modified fields to help the backend
          formData.append('modifiedFields', JSON.stringify(modifiedFields));

          // Send the update request
          const response = await fetch(`/api/creator/prizes/${id}`, {
            method: 'PUT',
            body: formData
          });
          
          if (!response.ok) {
            console.error(`Erro do servidor: ${response.status} ${response.statusText}`);
          }
          
          return response.json();
        } catch (error) {
          return {
            success: false,
            statusCode: 500,
            message: 'Erro ao comunicar com o servidor',
            error: error instanceof Error ? error.message : 'Erro desconhecido'
          };
        }
      },
    
      createPrize: async (prize: any) => {
        try {
          const response = await fetch('/api/creator/prizes', {
            method: 'POST',
            body: prize
          });
          // Verificar primeiro o status
          if (!response.ok) {
            console.error(`Erro do servidor: ${response.status} ${response.statusText}`);
          }
          return response.json();
        } catch (error) {
          return {
            success: false,
            statusCode: 500,
            message: 'Erro ao comunicar com o servidor',
            error: error instanceof Error ? error.message : 'Erro desconhecido'
          };
        }
      },



}

export default creatorPrizeAPIClient;