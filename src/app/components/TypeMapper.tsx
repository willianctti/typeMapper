"use client";

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, useAnimation } from 'framer-motion';
import CodeEditor from './CodeEditor';
import { inferType, objectToTypeString, safeJSONParse } from '../utils/typeInference';
import { ArrowRight, Check, Sparkles, Code } from 'lucide-react';
import { useTheme } from 'next-themes';
import confetti from 'canvas-confetti';

const Button: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & {
  className?: string;
}> = ({ children, className, ...props }) => {
  return (
    <button
      className={`rounded-md font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

const defaultInput = `{
  "id": 1234,
  "ativo": true,
  "nome": "Usuário Exemplo",
  "tags": ["importante", "cliente", "prioridade"],
  "valores": [10, 20, 30, 40.5],
  "tupla": [123, "texto", true],
  "endereco": {
    "rua": "Avenida Principal",
    "numero": 1000,
    "complemento": null,
    "cep": "12345-678"
  },
  "contatos": [
    { "tipo": "email", "valor": "exemplo@email.com" },
    { "tipo": "telefone", "valor": "11999998888" }
  ],
  "descricao": null,
  "diversos": [1, "texto", true, { "chave": "valor" }]
}`;

const advancedExample = `{
  "id": 1234,
  "ativo": true,
  "nome": "Exemplo Avançado",
  "dataCriacao": "2023-01-15T10:30:00",
  "tags": ["importante", "cliente", "prioridade"],
  "valores": [10, 20, 30, 40.5],
  "tupla": [123, "texto", true],
  
  "configuracoes": {
    "tema": "escuro",
    "notificacoes": {
      "email": true,
      "push": false,
      "frequencia": "diária",
      "horarios": [8, 12, 18]
    },
    "idioma": "pt-BR"
  },
  
  "funcoes": {
    "saudacao": "function(nome) { return 'Olá, ' + nome; }",
    "formatar": "(valor) => valor.toUpperCase()"
  },
  
  "descricao": null,
  "opcional": null,
  
  "diversos": [
    1, 
    "texto", 
    true, 
    { "chave": "valor" }, 
    ["a", "b", "c"]
  ],
  
  "metadados": {
    "criado": "2023-01-15T10:30:00",
    "modificado": "2023-01-20T15:45:00",
    "acessos": 42,
    "versao": "1.0.0",
    "autor": {
      "nome": "João Silva",
      "email": "joao@exemplo.com",
      "permissoes": ["leitura", "escrita", "admin"]
    }
  },
  
  "status": {
    "codigo": 200,
    "mensagem": "OK",
    "detalhes": {
      "servidor": "srv-01",
      "tempo": 120.45,
      "cache": false
    }
  }
}`;

const useSuccessConfetti = () => {
  const [active, setActive] = useState(false);
  
  const triggerConfetti = () => {
    setActive(true);
    
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#4F46E5', '#EC4899', '#8B5CF6', '#3B82F6']
    });
    
    setTimeout(() => setActive(false), 3000);
  };
  
  return { active, triggerConfetti };
};

const TypeMapper: React.FC = () => {
  const { resolvedTheme } = useTheme();
  const [input, setInput] = useState(defaultInput);
  const [output, setOutput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showParticles, setShowParticles] = useState(false);
  const arrowControls = useAnimation();
  const { active: confettiActive, triggerConfetti } = useSuccessConfetti();
  
  const processInput = useCallback(() => {
    if (!input.trim()) {
      setOutput('');
      setError(null);
      return;
    }

    setIsProcessing(true);
    
    setTimeout(() => {
      try {
        try {
          const jsonParsed = JSON.parse(input);
          setError(null);
          
          const typeObj = inferType(jsonParsed);
          const typeString = typeof typeObj === 'string' 
            ? typeObj 
            : objectToTypeString(typeObj);
          setOutput(typeString);
          
          triggerConfetti();
          setIsProcessing(false);
          return;
        } catch (jsonError) {
          console.log("Não é JSON válido, tentando safeJSONParse");
        }
        
        const { result, error: parseError } = safeJSONParse(input);
        
        if (parseError) {
          console.error("Parse error:", parseError);
          setError(`Erro de sintaxe: ${parseError}. Verifique se o seu objeto JavaScript está correto.`);
          setIsProcessing(false);
          return;
        }

        if (!result) {
          console.error("Failed to extract object from input");
          setError('Não foi possível extrair um objeto JavaScript válido. Certifique-se de que o seu input contém um objeto JavaScript válido.');
          setIsProcessing(false);
          return;
        }
        
        setError(null);
        
        try {
          const typeObj = inferType(result);
          const typeString = typeof typeObj === 'string' 
            ? typeObj 
            : objectToTypeString(typeObj);
          setOutput(typeString);
          
          triggerConfetti();
        } catch (err) {
          console.error("Error during type inference:", err);
          setError(`Erro ao inferir tipos: ${(err as Error).message}`);
        }
      } catch (err) {
        console.error("Unexpected error:", err);
        setError(`Erro inesperado: ${(err as Error).message}`);
      } finally {
        setIsProcessing(false);
      }
    }, 200);
  }, [input, triggerConfetti]);
  
  const loadExample = useCallback((exampleType: 'simple' | 'advanced') => {
    if (exampleType === 'simple') {
      setInput(defaultInput);
    } else {
      setInput(advancedExample);
    }
    setOutput('');
    setError(null);
    
    setTimeout(() => {
      processInput();
    }, 100);
  }, [processInput]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!output && input === defaultInput) {
        processInput();
      }
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (isProcessing) {
      setShowParticles(true);
      
      arrowControls.start({
        scale: [1, 1.2, 1],
        rotate: [0, 5, 0, -5, 0],
        transition: {
          duration: 1.5,
          repeat: Infinity,
          repeatType: 'loop'
        }
      });
    } else {
      setTimeout(() => setShowParticles(false), 800);
      
      arrowControls.stop();
    }
  }, [isProcessing, arrowControls]);

  const particles = useMemo(() => {
    return Array.from({ length: 8 }).map((_, i) => ({ 
      id: i,
      x: 50 + Math.random() * 200 - 100,
      y: 50 + Math.random() * 100 - 50,
      size: 2 + Math.random() * 6,
      color: i % 2 === 0 ? '#4F46E5' : '#EC4899',
      delay: Math.random() * 0.5
    }));
  }, []);

  return (
    <div className="w-full max-w-7xl mx-auto px-2">
      <div className="flex justify-between items-center mb-1.5">
        <div className="flex gap-2">
          <motion.button
            onClick={() => loadExample('simple')}
            className="px-2 py-1 text-xs rounded border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            Exemplo Simples
          </motion.button>
          <motion.button
            onClick={() => loadExample('advanced')}
            className="px-2 py-1 text-xs rounded border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            Exemplo Avançado
          </motion.button>
        </div>
        
        <motion.button 
          onClick={processInput}
          className="px-3 py-1.5 bg-gradient-to-r from-indigo-500 to-blue-500 text-white rounded-lg shadow-md flex items-center gap-1.5 hover:shadow-lg transition-all text-sm"
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
        >
          <span>Convert</span>
          <ArrowRight size={14} />
        </motion.button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-[calc(100vh-190px)]">
        <div className="h-full">
          <CodeEditor
            title="Input Object"
            value={input}
            onChange={setInput}
            language="javascript"
            placeholder="Paste your JavaScript object here..."
          />
        </div>

        <div className="h-full">
          <CodeEditor
            title="Type Output"
            value={isProcessing ? "Processing..." : output}
            language="typescript"
            readOnly
            error={error}
            placeholder="Type will appear here..."
          />
        </div>
      </div>
      
        <div className="flex justify-center mt-4 mb-1">
        <Button 
          onClick={processInput}
          disabled={isProcessing || !input.trim()}
          className={`relative group px-6 py-2 ${
            confettiActive ? 'bg-green-600 hover:bg-green-700' : 'bg-indigo-600 hover:bg-indigo-700'
          } text-white transition-all duration-300`}
        >
          {confettiActive ? (
            <motion.div 
              className="flex items-center"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring' }}
            >
              <Check className="mr-1 h-4 w-4" />
              Converted!
            </motion.div>
          ) : isProcessing ? (
            <span className="flex items-center">
              <motion.div
                className="w-4 h-4 mr-1 border-2 border-t-transparent border-white rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              />
              Converting...
            </span>
          ) : (
            <span className="flex items-center">
              <Code className="mr-1 h-4 w-4" />
              Convert to TypeScript
            </span>
          )}
        </Button>
      </div>
    </div>
  );
};

export default TypeMapper; 