'use client';

import React, { useState, useRef, useEffect, ReactNode } from 'react';
import styled from 'styled-components';
import { 
  FaBold, 
  FaItalic, 
  FaListUl, 
  FaListOl, 
  FaLink, 
  FaQuoteRight, 
  FaHeading, 
  FaUnderline,
  FaExclamationTriangle,
  FaAlignLeft,
  FaAlignCenter,
  FaAlignRight
} from 'react-icons/fa';

interface WysiwygEditorProps {
  id: string;
  label: string;
  icon?: ReactNode;
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLTextAreaElement>) => void;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  fullWidth?: boolean;
  className?: string;
  minHeight?: string;
  fixedWidth?: string;
}

// Styled components
const EditorContainer = styled.div<{ $fullWidth?: boolean }>`
  display: flex;
  flex-direction: column;
  flex: ${props => props.$fullWidth ? '1 0 100%' : '1'};
  margin-bottom: 28px;
  color: #333;
  background-color: transparent;
  
  &:last-child {
    margin-bottom: 0;
  }
  
  @media (max-width: 768px) {
    margin-bottom: 24px;
  }
`;

const EditorLabel = styled.label`
  display: block;
  margin-bottom: 10px;
  font-size: 0.95rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors?.text?.primary || '#333'};
`;

const RequiredMark = styled.span`
  color: #ef4444;
  margin-left: 4px;
`;

const EditorWrapper = styled.div<{ $minHeight?: string; $fixedWidth?: string }>`
  position: relative;
  width: ${props => props.$fixedWidth || '100%'};
  max-width: ${props => props.$fixedWidth || '100%'};
  min-width: ${props => props.$fixedWidth || '100%'};
  border-radius: 10px;
  border: 2px solid rgba(106, 17, 203, 0.1);
  background-color: white !important;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transition: all 0.2s ease;
  overflow: hidden;
  flex-shrink: 0;
  overflow-x: hidden;
  
  &:focus-within {
    border-color: #6a11cb;
    box-shadow: 0 0 0 3px rgba(106, 17, 203, 0.1);
  }
`;

const Toolbar = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 10px 12px;
  background-color: rgba(106, 17, 203, 0.03) !important;
  border-bottom: 1px solid rgba(106, 17, 203, 0.08);
  color: #666;
`;

const ToolbarButton = styled.button<{ $active?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 4px;
  background-color: ${props => props.$active ? 'rgba(106, 17, 203, 0.12)' : 'transparent'} !important;
  color: ${props => props.$active ? '#6a11cb' : '#666'} !important;
  border: none;
  transition: all 0.2s ease;
  cursor: pointer;
  
  &:hover {
    background-color: rgba(106, 17, 203, 0.08) !important;
    color: #6a11cb !important;
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    
    &:hover {
      background-color: transparent !important;
      color: #666 !important;
    }
  }
`;

const ToolbarDivider = styled.div`
  width: 1px;
  height: 24px;
  background-color: rgba(106, 17, 203, 0.1);
  margin: 0 4px;
`;

const EditorContent = styled.div<{ $minHeight?: string; $disabled?: boolean }>`
  min-height: ${props => props.$minHeight || '250px'};
  max-height: none;
  height: auto;
  width: 100%;
  max-width: 100%;
  padding: 16px;
  font-size: 0.95rem;
  line-height: 1.6;
  color: #333 !important;
  background-color: white !important;
  overflow-y: visible;
  overflow-x: hidden;
  word-wrap: break-word;
  word-break: break-word;
  outline: none;
  cursor: ${props => props.$disabled ? 'not-allowed' : 'text'};
  border-bottom: 1px solid transparent;
  transition: all 0.2s ease;
  position: relative;
  
  &:focus {
    border-bottom: 1px solid rgba(106, 17, 203, 0.3);
  }
  
  &:after {
    display: none;
  }
  
  /* Scrollbar estilizada */
  &::-webkit-scrollbar {
    width: 8px;
  }
  
  &::-webkit-scrollbar-track {
    background: rgba(106, 17, 203, 0.05);
    border-radius: 10px;
  }
  
  &::-webkit-scrollbar-thumb {
    background-color: rgba(106, 17, 203, 0.2);
    border-radius: 10px;
    
    &:hover {
      background-color: rgba(106, 17, 203, 0.3);
    }
  }
  
  /* Firefox */
  scrollbar-width: thin;
  scrollbar-color: rgba(106, 17, 203, 0.2) rgba(106, 17, 203, 0.05);
  
  &:empty:before {
    content: attr(data-placeholder);
    color: #a0aec0;
    opacity: 0.7;
  }
  
  h1, h2, h3, h4, h5, h6 {
    margin-top: 1em;
    margin-bottom: 0.5em;
    font-weight: 600;
  }
  
  p {
    margin-bottom: 1em;
  }
  
  ul, ol {
    margin-left: 2em;
    margin-bottom: 1em;
  }
  
  li {
    margin-bottom: 0.5em;
  }
  
  blockquote {
    border-left: 4px solid rgba(106, 17, 203, 0.2);
    padding-left: 1em;
    margin-left: 0;
    font-style: italic;
    color: #666;
    background-color: rgba(106, 17, 203, 0.02);
  }
`;

const HiddenTextArea = styled.textarea`
  display: none;
`;

const ErrorText = styled.div`
  color: #ef4444;
  font-size: 0.8rem;
  margin-top: 8px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 6px;
`;

const WysiwygEditor: React.FC<WysiwygEditorProps> = ({
  id,
  label,
  icon,
  placeholder = 'Escreva ou cole o texto aqui...',
  value = '',
  onChange,
  onBlur,
  error,
  disabled = false,
  required = false,
  fullWidth = false,
  className,
  minHeight = '250px',
  fixedWidth = '100%',
}) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const [initialRender, setInitialRender] = useState(true);
  const [html, setHtml] = useState('');
  
  // Initialize the editor content
  useEffect(() => {
    if (contentRef.current && initialRender) {
      contentRef.current.innerHTML = value;
      setInitialRender(false);
    }
  }, [value, initialRender]);
  
  // Update content when value changes from outside
  useEffect(() => {
    if (contentRef.current && !initialRender && value !== html) {
      contentRef.current.innerHTML = value;
    }
  }, [value, html, initialRender]);
  
  // Handle content changes and sync with hidden textarea
  const handleContentChange = () => {
    if (contentRef.current) {
      const htmlContent = contentRef.current.innerHTML;
      setHtml(htmlContent);
      
      if (onChange) {
        // Create a synthetic event
        const syntheticEvent = {
          target: {
            name: id,
            value: htmlContent
          }
        } as React.ChangeEvent<HTMLTextAreaElement>;
        
        onChange(syntheticEvent);
      }
    }
  };
  
  // Handle blur events
  const handleBlur = () => {
    if (onBlur && contentRef.current) {
      const syntheticEvent = {
        target: {
          name: id,
          value: contentRef.current.innerHTML
        }
      } as React.FocusEvent<HTMLTextAreaElement>;
      
      onBlur(syntheticEvent);
    }
  };
  
  // Format functions
  const formatDoc = (command: string, value: string = '') => {
    if (disabled) return;
    document.execCommand(command, false, value);
    if (contentRef.current) {
      contentRef.current.focus();
      handleContentChange();
    }
  };
  
  const addLink = () => {
    if (disabled) return;
    const url = prompt('Insira a URL do link:');
    if (url) {
      formatDoc('createLink', url);
    }
  };
  
  return (
    <EditorContainer $fullWidth={fullWidth} className={className}>
      <EditorLabel htmlFor={id}>
        {label}
        {required && <RequiredMark>*</RequiredMark>}
      </EditorLabel>
      
      <EditorWrapper  $fixedWidth={fixedWidth}>
        <Toolbar>
          <ToolbarButton 
            type="button" 
            onClick={() => formatDoc('bold')} 
            disabled={disabled}
            title="Negrito"
          >
            <FaBold />
          </ToolbarButton>
          
          <ToolbarButton 
            type="button" 
            onClick={() => formatDoc('italic')} 
            disabled={disabled}
            title="Itálico"
          >
            <FaItalic />
          </ToolbarButton>
          
          <ToolbarButton 
            type="button" 
            onClick={() => formatDoc('underline')} 
            disabled={disabled}
            title="Sublinhado"
          >
            <FaUnderline />
          </ToolbarButton>
          
          <ToolbarDivider />
          
          <ToolbarButton 
            type="button" 
            onClick={() => formatDoc('formatBlock', '<h2>')} 
            disabled={disabled}
            title="Título"
          >
            <FaHeading />
          </ToolbarButton>
          
          <ToolbarDivider />
          
          <ToolbarButton 
            type="button" 
            onClick={() => formatDoc('insertUnorderedList')} 
            disabled={disabled}
            title="Lista não ordenada"
          >
            <FaListUl />
          </ToolbarButton>
          
          <ToolbarButton 
            type="button" 
            onClick={() => formatDoc('insertOrderedList')} 
            disabled={disabled}
            title="Lista ordenada"
          >
            <FaListOl />
          </ToolbarButton>
          
          <ToolbarDivider />
          
          <ToolbarButton 
            type="button" 
            onClick={() => formatDoc('justifyLeft')} 
            disabled={disabled}
            title="Alinhar à esquerda"
          >
            <FaAlignLeft />
          </ToolbarButton>
          
          <ToolbarButton 
            type="button" 
            onClick={() => formatDoc('justifyCenter')} 
            disabled={disabled}
            title="Centralizar"
          >
            <FaAlignCenter />
          </ToolbarButton>
          
          <ToolbarButton 
            type="button" 
            onClick={() => formatDoc('justifyRight')} 
            disabled={disabled}
            title="Alinhar à direita"
          >
            <FaAlignRight />
          </ToolbarButton>
          
          <ToolbarDivider />
          
          <ToolbarButton 
            type="button" 
            onClick={addLink} 
            disabled={disabled}
            title="Inserir link"
          >
            <FaLink />
          </ToolbarButton>
          
          <ToolbarButton 
            type="button" 
            onClick={() => formatDoc('formatBlock', '<blockquote>')} 
            disabled={disabled}
            title="Citação"
          >
            <FaQuoteRight />
          </ToolbarButton>
        </Toolbar>
        
        <EditorContent
          ref={contentRef}
          contentEditable={!disabled}
          onInput={handleContentChange}
          onBlur={handleBlur}
          data-placeholder={placeholder}
          $disabled={disabled}
        />
        
        <HiddenTextArea
          id={id}
          name={id}
          value={html}
          readOnly
        />
      </EditorWrapper>
      
      {error && (
        <ErrorText>
          <FaExclamationTriangle /> {error}
        </ErrorText>
      )}
    </EditorContainer>
  );
};

export default WysiwygEditor; 