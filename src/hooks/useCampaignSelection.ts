import { ICampaign, INumberPackage } from "@/models/interfaces/ICampaignInterfaces";
import { useState, useCallback, useEffect } from "react";

export interface INumberPackageCampaign {
    _id?: string;
    name: string;     
    campaignCode?: string;      // Nome do pacote (ex: "Pacote Bronze", "Pacote Prata", "Pacote Ouro")
    description?: string;   // Descrição opcional do pacote
    quantity: number;       // Quantidade de números no pacote
    price: number;          // Preço total do pacote
    discount?: number;      // Desconto percentual em relação à compra individual
    isActive: boolean;      // Se o pacote está disponível para compra
    highlight?: boolean;    // Se o pacote deve ser destacado (pacote recomendado)
    order?: number;         // Ordem de exibição
    maxPerUser?: number;    // Limite de compra por usuário (opcional)
    totalPrice?: number;
  }


export const useCampaignSelection = (campaign: ICampaign) => {
    const [selection, setSelection] = useState<INumberPackageCampaign | null>(null);

    const selectPackage = useCallback((packageData: INumberPackageCampaign) => {
        console.log('selectPackage', packageData);
        setSelection({
            campaignCode: campaign.campaignCode,
            ...packageData,
            totalPrice: packageData.price
        });
    }, []);

    const selectPackageFunction = useCallback((packageData: INumberPackageCampaign) => {
        console.log('selectPackage', packageData);
        setSelection({
            campaignCode: campaign.campaignCode,
            ...packageData,
        });
    }, []);


    const clearSelection = useCallback(() => {
        setSelection(null);
        selectPackageFunction({
            campaignCode: campaign.campaignCode,
            isActive: true,
            quantity: campaign.minNumbersPerUser,
            price: campaign.individualNumberPrice,
            name: 'Pacote Mínimo',
            totalPrice: campaign.individualNumberPrice * campaign.minNumbersPerUser
          });
    }, [selection]);
    
    const updateQuantity = useCallback((newQuantity: number ) => {
        console.log('updateQuantity', newQuantity);
        const matchingPackage = campaign.numberPackages.find(pkg => pkg.quantity === newQuantity);
        if(matchingPackage){
            selectPackageFunction({
                ...matchingPackage,
                totalPrice: matchingPackage.price
            });
        }else{
            selectPackageFunction({
                ...selection!,
                quantity: newQuantity,
                totalPrice: (campaign.individualNumberPrice * newQuantity)
            });
        }

    },[campaign, selectPackage])

    return { selection, selectPackage, selectPackageFunction, clearSelection, updateQuantity };
}