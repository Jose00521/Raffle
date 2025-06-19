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
            isCombo: true, // Force true here since we're selecting a package
            individualNumberPrice: campaign.individualNumberPrice,
            ...packageData,
            totalPrice: packageData.price
        });
    }, []);

    const selectPackageFunction = useCallback((packageData: INumberPackageCampaign) => {
        console.log('selectPackage', packageData);
        setSelection({
            campaignCode: campaign.campaignCode,
            isCombo: packageData.isCombo || false,
            individualNumberPrice: campaign.individualNumberPrice,
            ...packageData,
        });
    }, []);


    const clearSelection = useCallback(() => {
        setSelection(null);
        setIsCombo(false);
        setSelection({
            campaignCode: campaign.campaignCode,
            isActive: true,
            isCombo: false,
            quantity: campaign.minNumbersPerUser,
            price: campaign.individualNumberPrice,
            name: 'Pacote Mínimo',
            individualNumberPrice: campaign.individualNumberPrice,
            totalPrice: campaign.individualNumberPrice * campaign.minNumbersPerUser
          });
    }, [campaign]);
    
    const updateQuantity = useCallback((newQuantity: number ) => {
        if(newQuantity > (campaign.maxNumbersPerUser || 0) || newQuantity < (campaign.minNumbersPerUser || 0)){
            return;
        }
        const matchingPackage = campaign.numberPackages.find(pkg => pkg.quantity === newQuantity);
        if(matchingPackage){
            setIsCombo(true);
            setSelection({
                campaignCode: campaign.campaignCode,
                isCombo: true,
                individualNumberPrice: campaign.individualNumberPrice,
                ...matchingPackage,
                totalPrice: matchingPackage.price
            });
        }else{
            setIsCombo(false);
            setSelection({
                campaignCode: campaign.campaignCode,
                isCombo: false,
                individualNumberPrice: campaign.individualNumberPrice,
                ...selection!,
                quantity: newQuantity,
                totalPrice: (campaign.individualNumberPrice * newQuantity)
            });
        }

    },[campaign, selectPackage])

    return { selection, selectPackage, selectPackageFunction, clearSelection, updateQuantity };
}