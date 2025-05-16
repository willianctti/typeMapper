
interface ObjectTypeResult {
  [key: string]: string | ObjectTypeResult;
}

type TypeResult = string | ObjectTypeResult;

function isPlainObject(value: any): boolean {
  if (value === null || typeof value !== 'object') return false;
  
  const proto = Object.getPrototypeOf(value);
  if (proto === null) return true;
  
  const Ctor = Object.prototype.hasOwnProperty.call(proto, 'constructor') &&
               proto.constructor;
               
  return typeof Ctor === 'function' && 
         Function.toString.call(Ctor) === Function.toString.call(Object);
}


function isTupleArray(arr: any[]): boolean {
  if (arr.length <= 1) return false;
  if (arr.length > 10) return false;
  
  const types = arr.map(item => typeof item);
  const uniqueTypes = new Set(types);
  
  if (uniqueTypes.size > 1) return true;
  
  if (uniqueTypes.size === 1 && types[0] === 'object') {
    const objectSignatures = arr.map(item => {
      if (item === null) return 'null';
      return Object.keys(item).sort().join('|');
    });
    return new Set(objectSignatures).size > 1;
  }
  
  return false;
}


function getFunctionType(fn: Function): string {
  try {
    const fnStr = fn.toString();
    const argsMatch = fnStr.match(/\(([^)]*)\)/);
    const params = argsMatch && argsMatch[1] ? argsMatch[1].split(',').map(p => p.trim()) : [];
    
    const typedParams = params.map((_, i) => `param${i}: any`);
    
    return `(${typedParams.join(', ')}) => any`;
  } catch (e) {
    return '(...args: any[]) => any';
  }
}


export function inferType(value: any, depth: number = 0, maxDepth: number = 10): TypeResult {
  if (depth > maxDepth) {
    return 'any';
  }
  
  if (value === null) return 'null';
  if (value === undefined) return 'undefined';
  
  const type = typeof value;
  
  if (type === 'string') return 'string';
  if (type === 'number') {
    return Number.isInteger(value) ? 'number' : 'number';
  }
  if (type === 'boolean') return 'boolean';
  if (type === 'symbol') return 'symbol';
  if (type === 'bigint') return 'bigint';
  
  if (type === 'function') {
    return getFunctionType(value);
  }
  
  if (Array.isArray(value)) {
    if (value.length === 0) return 'any[]';
    
    if (isTupleArray(value)) {
      const itemTypes = value.map(item => inferType(item, depth + 1, maxDepth));
      return `[${itemTypes.join(', ')}]`;
    }
    
    const types = new Set<string>();
    
    value.forEach(item => {
      const itemType = inferType(item, depth + 1, maxDepth);
      if (typeof itemType === 'string') {
        types.add(itemType);
      } else {
        types.add('object');
      }
    });
    
    if (types.size === 0) return 'any[]';
    if (types.size === 1) return `${Array.from(types)[0]}[]`;
    
    return `(${Array.from(types).join(' | ')})[]`;
  }
  
  if (type === 'object') {
    if (value instanceof Date) return 'Date';
    if (value instanceof RegExp) return 'RegExp';
    if (value instanceof Map) return 'Map<any, any>';
    if (value instanceof Set) return 'Set<any>';
    if (value instanceof Promise) return 'Promise<any>';
    if (value instanceof Error) return 'Error';
    if (value instanceof Int8Array ||
        value instanceof Uint8Array ||
        value instanceof Uint8ClampedArray ||
        value instanceof Int16Array ||
        value instanceof Uint16Array ||
        value instanceof Int32Array ||
        value instanceof Uint32Array ||
        value instanceof Float32Array ||
        value instanceof Float64Array ||
        value instanceof BigInt64Array ||
        value instanceof BigUint64Array) {
      return value.constructor.name;
    }
    
    if (isPlainObject(value)) {
      const objType: Record<string, TypeResult> = {};
      
      const allKeys = Object.keys(value);
      
      for (const key of allKeys) {
        const propValue = value[key];
        const propType = inferType(propValue, depth + 1, maxDepth);
        
        objType[key] = propType;
      }
      
      return objType;
    }
    
    try {
      const constructorName = value.constructor.name;
      if (constructorName && constructorName !== 'Object') {
        return constructorName;
      }
    } catch (e) {
    }
    
    return 'object';
  }
  
  return 'any';
}


export function objectToTypeString(obj: TypeResult, indentLevel: number = 0): string {
  if (typeof obj === 'string') return obj;
  
  const entries = Object.entries(obj);
  if (entries.length === 0) return '{}';
  
  const indent = '  '.repeat(indentLevel);
  const innerIndent = '  '.repeat(indentLevel + 1);
  
  const typeLines = entries.map(([key, value]) => {
    const escapedKey = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(key) 
      ? key 
      : `'${key.replace(/'/g, "\\'")}'`;
      
    const isOptional = typeof value === 'string' && 
      (value.includes('undefined') || value.includes('null'));
    
    const valueStr = typeof value === 'object' 
      ? objectToTypeString(value, indentLevel + 1)
      : value;
      
    const optionalMarker = isOptional ? '?' : '';
    
    return `${innerIndent}${escapedKey}${optionalMarker}: ${valueStr};`;
  });
  
  return `{\n${typeLines.join('\n')}\n${indent}}`;
}


export function extractObjectLiteral(input: string): string | null {
  if (!input || typeof input !== 'string') return null;
  
  let cleanedInput = input.replace(/\/\/.*$/gm, '').replace(/\/\*[\s\S]*?\*\//g, '');

  const declareRegex = /(?:const|let|var)\s+\w+\s*=\s*({[\s\S]*?});?(?:$|\/|\/\/|\/\*)/;
  let match = declareRegex.exec(cleanedInput);
  if (match && match[1]) {
    return match[1].trim();
  }

  const assignRegex = /\w+\s*=\s*({[\s\S]*?});?(?:$|\/|\/\/|\/\*)/;
  match = assignRegex.exec(cleanedInput);
  if (match && match[1]) {
    return match[1].trim();
  }

  try {
    JSON.parse(cleanedInput);
    return cleanedInput.trim();
  } catch (e) {
  }

  const returnRegex = /return\s+({[\s\S]*?});/;
  match = returnRegex.exec(cleanedInput);
  if (match && match[1]) {
    return match[1].trim();
  }

  const jsonParseRegex = /JSON\.parse\(['"](.*?)['"]\)/;
  match = jsonParseRegex.exec(cleanedInput);
  if (match && match[1]) {
    try {
      const stringContent = match[1].replace(/\\"/g, '"');
      JSON.parse(stringContent);
      return stringContent.trim();
    } catch (e) {
    }
  }

  const objectLiteralRegex = /([\[\{][\s\S]*?[\]\}])/g;
  let objects: string[] = [];
  
  while ((match = objectLiteralRegex.exec(cleanedInput)) !== null) {
    if (match[1]) {
      objects.push(match[1].trim());
    }
  }

  if (objects.length > 0) {
    objects.sort((a, b) => b.length - a.length);
    
    const objectLiterals = objects.filter(obj => obj.trim().startsWith('{'));
    if (objectLiterals.length > 0) {
      return objectLiterals[0];
    }
    
    return objects[0];
  }

  const lastAttemptRegex = /{[\s\S]*}/;
  match = lastAttemptRegex.exec(cleanedInput);
  if (match && match[0]) {
    return match[0].trim();
  }

  return null;
}


function prepareInput(input: string): string {
  if (!input) return '';
  
  input = input.replace(/\/\/.*$/gm, '');
  
  input = input.replace(/\/\*[\s\S]*?\*\//g, '');
  
  const varDeclaration = input.match(/(?:const|let|var)\s+\w+\s*=\s*({[\s\S]*})/);
  if (varDeclaration && varDeclaration[1]) {
    return varDeclaration[1];
  }
  
  return input;
}


export function safeJSONParse(input: string): { result: any, error: string | null } {
  if (!input || typeof input !== 'string') {
    return { result: null, error: 'Input inválido' };
  }

  const preprocessed = prepareInput(input);

  const sanitized = extractObjectLiteral(preprocessed);
  
  if (!sanitized) {
    const backupSanitized = extractObjectLiteral(input);
    if (!backupSanitized) {
      return { result: null, error: "Couldn't extract a valid object from the input" };
    }
    return processSanitizedInput(backupSanitized);
  }
  
  const result = processSanitizedInput(sanitized);
  
  if (result.error && !result.result) {
    try {
      if (/setTimeout|setInterval|eval|__proto__|window|document|localStorage|fetch|XMLHttpRequest/i.test(input)) {
        return { result: null, error: "Código potencialmente perigoso detectado" };
      }
      
      const safeCode = `
        try {
          (function() {
            // Remover coisas perigosas do escopo
            const window = undefined;
            const document = undefined;
            const alert = undefined;
            const console = undefined;
            const localStorage = undefined;
            const sessionStorage = undefined;
            const fetch = undefined;
            const XMLHttpRequest = undefined;
            
            // Avaliar e retornar o objeto
            return ${sanitized};
          })();
        } catch(e) {
          return { __error__: e.message };
        }
      `;
      
      const evalResult = new Function('return ' + safeCode)();
      
      if (evalResult && evalResult.__error__) {
        return { result: null, error: evalResult.__error__ };
      }
      
      return { result: evalResult, error: null };
    } catch (e) {
      return result;
    }
  }
  
  return result;
}


function processSanitizedInput(sanitized: string): { result: any, error: string | null } {
  try {
    let jsonCompatible = sanitized
      .replace(/`([^`]*)`/g, '"$1"')
      .replace(/\${([^}]*)}/g, "TEMPLATE_EXPR")
      .replace(/(['"])?([a-zA-Z0-9_]+)(['"])?:/g, '"$2":')
      .replace(/:\s*'([^']*)'/g, ': "$1"')
      .replace(/,(\s*[}\]])/g, '$1');
    
    jsonCompatible = jsonCompatible.replace(/\\\\([^\\])/g, "\\$1");
    
    jsonCompatible = jsonCompatible.replace(/"[^"]*"/g, (match) => {
      return match.replace(/\n/g, "\\n").replace(/\t/g, "\\t");
    });
    
    const replacements: Array<{ pattern: string | RegExp, replacement: string, values: string[] }> = [];

    const dateValues: string[] = [];
    let datePattern = /new Date\((.*?)\)/g;
    let withDatesReplaced = jsonCompatible.replace(datePattern, (match, args) => {
      dateValues.push(args);
      return `"__DATE_PLACEHOLDER_${dateValues.length - 1}__"`;
    });

    replacements.push({
      pattern: datePattern,
      replacement: `"__DATE_PLACEHOLDER_$1__"`,
      values: dateValues
    });

    const regexLiteralValues: string[] = [];
    const regexLiteralPattern = /\/([^/\\]*(?:\\.[^/\\]*)*)\/([gimysd]*)/g;
    
    let withRegexLiteralReplaced = withDatesReplaced.replace(regexLiteralPattern, (match, pattern, flags) => {
      regexLiteralValues.push(JSON.stringify({ pattern, flags }));
      return `"__REGEX_LITERAL_PLACEHOLDER_${regexLiteralValues.length - 1}__"`;
    });

    replacements.push({
      pattern: regexLiteralPattern,
      replacement: `"__REGEX_LITERAL_PLACEHOLDER_$1__"`,
      values: regexLiteralValues
    });

    const regexConstructorValues: string[] = [];
    const regexConstructorPattern = /new RegExp\((.*?)(?:,\s*(.*?))?\)/g;
    
    let withRegexConstructorReplaced = withRegexLiteralReplaced.replace(regexConstructorPattern, (match, pattern, flags) => {
      regexConstructorValues.push(JSON.stringify({ pattern, flags: flags || '' }));
      return `"__REGEX_CONSTRUCTOR_PLACEHOLDER_${regexConstructorValues.length - 1}__"`;
    });

    replacements.push({
      pattern: regexConstructorPattern,
      replacement: `"__REGEX_CONSTRUCTOR_PLACEHOLDER_$1__"`,
      values: regexConstructorValues
    });

    const functionValues: string[] = [];
    const functionPattern = /(?:"[^"]*":\s*)?(function\s*\([^)]*\)\s*{[^}]*}|\([^)]*\)\s*=>\s*{[^}]*}|\([^)]*\)\s*=>[^,}]*)/g;
    
    let withFunctionsReplaced = withRegexConstructorReplaced.replace(functionPattern, (match, funcDef) => {
      if (match.includes(':')) {
        const parts = match.split(':');
        functionValues.push(parts.slice(1).join(':').trim());
        return `${parts[0]}: "__FUNCTION_PLACEHOLDER_${functionValues.length - 1}__"`;
      } else {
        functionValues.push(match);
        return `"__FUNCTION_PLACEHOLDER_${functionValues.length - 1}__"`;
      }
    });

    replacements.push({
      pattern: functionPattern,
      replacement: `"__FUNCTION_PLACEHOLDER_$1__"`,
      values: functionValues
    });

    try {
      withFunctionsReplaced = withFunctionsReplaced
        .replace(/,\s*}/g, '}')
        .replace(/,\s*\]/g, ']');
      
      withFunctionsReplaced = withFunctionsReplaced.replace(/"undefined"/g, 'null');
      
      console.log("Tentando analisar:", withFunctionsReplaced);
      
      const parsed = JSON.parse(withFunctionsReplaced);
      
      function restoreValues(obj: any): any {
        if (!obj) return obj;
        
        if (typeof obj === 'string') {
          const dateMatch = obj.match(/__DATE_PLACEHOLDER_(\d+)__/);
          if (dateMatch) {
            const index = parseInt(dateMatch[1]);
            if (dateValues[index] !== undefined) {
              try {
                const dateArgs = dateValues[index].split(',').map(arg => {
                  const trimmed = arg.trim();
                  return isNaN(Number(trimmed)) ? trimmed.replace(/["']/g, '') : Number(trimmed);
                });
                
                if (dateArgs.length === 0) {
                  return new Date();
                } else if (dateArgs.length === 1) {
                  return new Date(dateArgs[0]);
                } else {
                  return new Date(
                    Number(dateArgs[0]), 
                    dateArgs.length > 1 ? Number(dateArgs[1]) : 0,
                    dateArgs.length > 2 ? Number(dateArgs[2]) : 1,
                    dateArgs.length > 3 ? Number(dateArgs[3]) : 0,
                    dateArgs.length > 4 ? Number(dateArgs[4]) : 0,
                    dateArgs.length > 5 ? Number(dateArgs[5]) : 0,
                    dateArgs.length > 6 ? Number(dateArgs[6]) : 0
                  );
                }
              } catch (e) {
                return new Date();
              }
            }
          }
          
          const regexLiteralMatch = obj.match(/__REGEX_LITERAL_PLACEHOLDER_(\d+)__/);
          if (regexLiteralMatch) {
            const index = parseInt(regexLiteralMatch[1]);
            if (regexLiteralValues[index] !== undefined) {
              try {
                const { pattern, flags } = JSON.parse(regexLiteralValues[index]);
                const escapedPattern = pattern.replace(/\\/g, '\\\\');
                return new RegExp(escapedPattern, flags);
              } catch (e) {
                return /./;
              }
            }
          }
          
          const regexConstructorMatch = obj.match(/__REGEX_CONSTRUCTOR_PLACEHOLDER_(\d+)__/);
          if (regexConstructorMatch) {
            const index = parseInt(regexConstructorMatch[1]);
            if (regexConstructorValues[index] !== undefined) {
              try {
                const { pattern, flags } = JSON.parse(regexConstructorValues[index]);
                
                let processedPattern = pattern;
                if (pattern.startsWith('"') && pattern.endsWith('"') || 
                    pattern.startsWith("'") && pattern.endsWith("'")) {
                  processedPattern = pattern.slice(1, -1);
                }
                
                return new RegExp(processedPattern, flags || '');
              } catch (e) {
                return /./;
              }
            }
          }
          
          const functionMatch = obj.match(/__FUNCTION_PLACEHOLDER_(\d+)__/);
          if (functionMatch) {
            const index = parseInt(functionMatch[1]);
            if (functionValues[index] !== undefined) {
              return { __function__: functionValues[index] };
            }
          }
        }
        
        if (typeof obj === 'object' && obj !== null) {
          if (Array.isArray(obj)) {
            return obj.map(item => restoreValues(item));
          } else {
            const result: Record<string, any> = {};
            for (const key in obj) {
              result[key] = restoreValues(obj[key]);
            }
            return result;
          }
        }
        
        return obj;
      }
      
      const restoredObj = restoreValues(parsed);
      return { result: restoredObj, error: null };
    } catch (e) {
      console.error("Erro ao analisar JSON:", e, "\nTexto:", withFunctionsReplaced);
      return { result: null, error: (e as Error).message };
    }
  } catch (e) {
    console.error("Erro no pré-processamento:", e);
    return { result: null, error: (e as Error).message };
  }
} 