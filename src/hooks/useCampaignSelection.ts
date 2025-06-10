import { ICampaign, INumberPackage } from "@/models/interfaces/ICampaignInterfaces";
import { useState, useCallback, useEffect } from "react";

export interface INumberPackageCampaign {
    _id?: string;
    name: string;     
    campaignCode?: string;      // Nome do pacote (ex: "Pacote Bronze", "Pacote Prata", "Pacote Ouro")
    description?: string;
    isCombo?: boolean;
    quantity: number;       // Quantidade de números no pacote
    price: number;          // Preço total do pacote
    discount?: number;    
    individualNumberPrice?: number;  // Desconto percentual em relação à compra individual
    isActive: boolean;      // Se o pacote está disponível para compra
    highlight?: boolean;    // Se o pacote deve ser destacado (pacote recomendado)
    order?: number;         // Ordem de exibição
    maxPerUser?: number;    // Limite de compra por usuário (opcional)
    totalPrice?: number;
  }


export const useCampaignSelection = (campaign: ICampaign) => {
    const [selection, setSelection] = useState<INumberPackageCampaign | null>(null);
    const [isCombo, setIsCombo] = useState(false);

    const selectPackage = useCallback((packageData: INumberPackageCampaign) => {
        setIsCombo(true);
        setSelection({
            campaignCode: campaign.campaignCode,
            isCombo,
            individualNumberPrice: campaign.individualNumberPrice,
            ...packageData,
            totalPrice: packageData.price
        });
    }, []);

    const selectPackageFunction = useCallback((packageData: INumberPackageCampaign) => {
        console.log('selectPackage', packageData);
        setSelection({
            campaignCode: campaign.campaignCode,
            isCombo,
            individualNumberPrice: campaign.individualNumberPrice,
            ...packageData,
        });
    }, []);


    const clearSelection = useCallback(() => {
        setSelection(null);
        setIsCombo(false);
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
            setIsCombo(true);
            selectPackageFunction({
                ...matchingPackage,
                totalPrice: matchingPackage.price
            });
        }else{
            setIsCombo(false);
            selectPackageFunction({
                ...selection!,
                quantity: newQuantity,
                totalPrice: (campaign.individualNumberPrice * newQuantity)
            });
        }

    },[campaign, selectPackage])

    return { selection, selectPackage, selectPackageFunction, clearSelection, updateQuantity };
}