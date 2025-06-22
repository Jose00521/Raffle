'use client';

import React, { useState } from 'react';
import CurrencyInput from '@/components/common/CurrencyInput';
import styled from 'styled-components';
import { FaMoneyBillWave } from 'react-icons/fa';

const ExampleContainer = styled.div`
  padding: 20px;
  max-width: 600px;
  margin: 0 auto;
`;

const Title = styled.h1`
  margin-bottom: 20px;
  color: ${({ theme }) => theme.colors?.text?.primary || '#333'};
`;

const Subtitle = styled.h2`
  margin: 20px 0;
  font-size: 1.2rem;
  color: ${({ theme }) => theme.colors?.text?.secondary || '#555'};
`;

const InputRow = styled.div`
  margin-bottom: 30px;
`;

const ValueDisplay = styled.div`
  margin-top: 8px;
  padding: 8px;
  background: #f9f9f9;
  border-radius: 4px;
  font-size: 0.9rem;
  color: ${({ theme }) => theme.colors?.text?.secondary || '#666'};
`;

const CurrencyInputExample = () => {
  const [valorReais, setValorReais] = useState<number>(0);
  const [valorDolares, setValorDolares] = useState<number>(0);
  const [valorEuros, setValorEuros] = useState<number>(0);
  const [valorNegativo, setValorNegativo] = useState<number>(0);

  return (
    <ExampleContainer>
      <Title>Demonstração do CurrencyInput</Title>
      
      <Subtitle>Moeda Brasileira (Padrão)</Subtitle>
      <InputRow>
        <CurrencyInput
          id="valor-reais"
          label="Valor em Reais"
          icon={<FaMoneyBillWave />}
          currency="BRL"
          value={valorReais}
          onChange={(e) => setValorReais(Number(e.target.value))}
          helpText="Digite um valor em reais"
          placeholder="R$ 0,00"
        />
        <ValueDisplay>
          Valor armazenado: {valorReais} (número)
        </ValueDisplay>
      </InputRow>

      <Subtitle>Dólar Americano</Subtitle>
      <InputRow>
        <CurrencyInput
          id="valor-dolares"
          label="Valor em Dólares"
          icon={<FaMoneyBillWave />}
          currency="USD"
          value={valorDolares}
          onChange={(e) => setValorDolares(Number(e.target.value))}
        />
        <ValueDisplay>
          Valor armazenado: {valorDolares} (número)
        </ValueDisplay>
      </InputRow>

      <Subtitle>Euro</Subtitle>
      <InputRow>
        <CurrencyInput
          id="valor-euros"
          label="Valor em Euros"
          icon={<FaMoneyBillWave />}
          currency="EUR"
          value={valorEuros}
          onChange={(e) => setValorEuros(Number(e.target.value))}
        />
        <ValueDisplay>
          Valor armazenado: {valorEuros} (número)
        </ValueDisplay>
      </InputRow>

      <Subtitle>Suporte a Valores Negativos</Subtitle>
      <InputRow>
        <CurrencyInput
          id="valor-negativo"
          label="Valor com Sinal"
          icon={<FaMoneyBillWave />}
          currency="BRL"
          allowNegative={true}
          value={valorNegativo}
          onChange={(e) => setValorNegativo(Number(e.target.value))}
          helpText="Este campo permite valores negativos"
        />
        <ValueDisplay>
          Valor armazenado: {valorNegativo} (número)
        </ValueDisplay>
      </InputRow>
    </ExampleContainer>
  );
};

export default CurrencyInputExample; 