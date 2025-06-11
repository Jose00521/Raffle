import 'reflect-metadata';
import { PrizeController } from "@/server/controllers/PrizeController";
import { container } from "@/server/container/container";
import { NextRequest, NextResponse } from "next/server";
import { withAuth } from '@/lib/auth/apiAuthHelper';
import { Session } from 'next-auth';

// export async function GET(
//     request: NextRequest,
//     { params }: { params: { id: string } }
// ) {
//     try {
//         const { id } = await params;
//         if (!id) {
//             return NextResponse.json({ error: 'ID do prêmio não fornecido' }, { status: 400 });
//         }
//         const prizeController = container.resolve(PrizeController);
//         const prize = await prizeController.getPrizeById(id);
//         return NextResponse.json(prize);
//     } catch (error) {
//         return NextResponse.json({ error: 'Erro ao buscar prêmio' }, { status: 500 });
//     }
// }

export const GET = withAuth(async (request: NextRequest, { params, session }: { params: { id: string }, session: Session }) => {
    try {
        const { id } = await params;
        if (!id) {
            return NextResponse.json({ error: 'ID do prêmio não fornecido' }, { status: 400 });
        }
        const prizeController = container.resolve(PrizeController);
        const prize = await prizeController.getPrizeById(id, session);
        return NextResponse.json(prize);
    } catch (error) {
        return NextResponse.json({ error: 'Erro ao buscar prêmio' }, { status: 500 });
    }
}, { allowedRoles: ['creator'] });




export const PUT = withAuth(async (request: NextRequest, { params, session }: { params: { id: string }, session: Session }) => {
    try {
        const { id } = await params;
        if (!id) {
            return NextResponse.json({ 
                success: false, 
                message: 'ID do prêmio não fornecido' 
            }, { status: 400 });
        }

        // Parse the form data
        const formData = await request.formData();
        
        // Get the list of modified fields
        const modifiedFieldsJSON = formData.get('modifiedFields') as string;
        const modifiedFields = JSON.parse(modifiedFieldsJSON || '[]');
        
        if (!modifiedFields || !modifiedFields.length) {
            return NextResponse.json({ 
                success: false, 
                message: 'Nenhum campo modificado foi especificado' 
            }, { status: 400 });
        }
        
        // Build the update object with only the modified fields
        const updateData: Record<string, any> = {};
        
        for (const field of modifiedFields) {
            // Skip the modifiedFields entry itself
            if (field === 'modifiedFields') continue;
            
            // Handle image arrays specially
            if (field === 'images') {
                const imageFiles: File[] = [];
                
                // Check for image[index] format for multiple files
                for (let i = 0; ; i++) {
                    const imageKey = `images[${i}]`;
                    const image = formData.get(imageKey);
                    
                    if (!image) break;
                    
                    if (image instanceof File) {
                        imageFiles.push(image);
                    } else if (typeof image === 'string') {
                        // For URLs that weren't changed, push them as is
                        imageFiles.push(image as unknown as File);
                    }
                }
                
                if (imageFiles.length > 0) {
                    updateData.images = imageFiles;
                }
            }
            // Handle individual image specially
            else if (field === 'image') {
                const image = formData.get('image');
                if (image) {
                    updateData.image = image;
                }
            }
            // Handle regular fields
            else {
                const value = formData.get(field);
                if (value !== null && value !== undefined) {
                    updateData[field] = value;
                }
            }
        }
        
        console.log('Updating prize with data:', updateData);
        console.log('Modified fields:', modifiedFields);
        
        // Call the controller to update the prize
        const prizeController = container.resolve(PrizeController);
        const result = await prizeController.updatePrize(id, updateData, session);

        return NextResponse.json(result);
    } catch (error) {
        console.error('Error updating prize:', error);
        return NextResponse.json({ 
            success: false, 
            message: 'Erro ao atualizar prêmio',
            error: error instanceof Error ? error.message : 'Erro desconhecido'
        }, { status: 500 });
    }
}, { allowedRoles: ['creator'] });


export const DELETE = withAuth(async (request: NextRequest, { params, session }: { params: { id: string }, session: Session }) => {
    try {
        const { id } = await params;
        if (!id) {
            return NextResponse.json({ error: 'ID do prêmio não fornecido' }, { status: 400 });
        }

        console.log("chegou aqui",id);

        const prizeController = container.resolve(PrizeController);
        const prize = await prizeController.deletePrize(id, session);

        return NextResponse.json(prize);
    } catch (error) {
        return NextResponse.json({ error: 'Erro ao deletar prêmio' }, { status: 500 });
    }
}, { allowedRoles: ['creator'] });