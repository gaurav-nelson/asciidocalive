// Kroki diagram rendering utility for browser environments
// Supports PlantUML, Mermaid, GraphViz, Ditaa, and more via Kroki.io API

import { indexedDBService } from './indexedDBService';

const KROKI_SERVER = 'https://kroki.io';

// Simple DJB2 hash function for content hashing
function hashContent(str: string): string {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash) + str.charCodeAt(i); // hash * 33 + c
  }
  // Convert to positive hex string
  return (hash >>> 0).toString(16);
}

interface DiagramBlock {
  element: Element;
  type: string;
  content: string;
}

// Extract diagram blocks from HTML
function extractDiagramBlocks(container: HTMLElement): DiagramBlock[] {
  const blocks: DiagramBlock[] = [];
  
  // Find all code blocks with diagram types
  const diagramTypes = [
    'plantuml', 'mermaid', 'graphviz', 'ditaa', 'blockdiag', 'seqdiag',
    'actdiag', 'nwdiag', 'packetdiag', 'rackdiag', 'c4plantuml', 'erd',
    'excalidraw', 'pikchr', 'structurizr', 'vega', 'vegalite', 'wavedrom',
    'bpmn', 'bytefield', 'svgbob', 'd2', 'dbml', 'nomnoml'
  ];
  
  // Asciidoctor wraps diagram blocks in div.listingblock with class matching diagram type
  const listingBlocks = container.querySelectorAll('.listingblock');
  
  listingBlocks.forEach((block) => {
    const codeElement = block.querySelector('pre code') || block.querySelector('pre');
    
    // Check what's in the previous sibling (might be heading with diagram type)
    const prevHeading = block.previousElementSibling;
    const headingText = (prevHeading?.textContent || '').toLowerCase().trim();
    
    // Try to detect diagram type from heading text
    let detectedType: string | null = null;
    
    // Only match if the heading explicitly indicates it's a specific diagram type
    // We need to be more strict to avoid false matches like "Diagram rendering (PlantUML, ...)"
    const diagramHeadingPatterns: Record<string, RegExp> = {
      'plantuml': /^plantuml\b|plantuml\s+(sequence|class|use\s*case|activity|component|state|deployment|timing|object|diagram)/i,
      'mermaid': /^mermaid\b|mermaid\s+(flowchart|sequence|class|state|pie|gantt|diagram)/i,
      'graphviz': /^graphviz\b|graphviz\s+(directed|graph|diagram)/i,
      'ditaa': /^ditaa\b|ditaa\s+diagram/i,
      'blockdiag': /^blockdiag\b|blockdiag\s+diagram/i,
      'seqdiag': /^seqdiag\b|seqdiag\s+diagram/i,
      'actdiag': /^actdiag\b|actdiag\s+diagram/i,
      'nwdiag': /^nwdiag\b|nwdiag\s+diagram/i,
    };
    
    // Check if heading matches any diagram type pattern
    for (const [type, pattern] of Object.entries(diagramHeadingPatterns)) {
      if (pattern.test(headingText)) {
        detectedType = type;
        break;
      }
    }
    
    // If we found a diagram type in the heading, extract and render it
    if (detectedType && codeElement) {
      const content = codeElement.textContent || '';
      if (content.trim()) {
        blocks.push({
          element: block,
          type: detectedType,
          content: content.trim()
        });
        return; // Found it, done with this block
      }
    }
    
    // Fallback 1: Check data-lang attribute
    if (codeElement) {
      const lang = codeElement.getAttribute('data-lang');
      if (lang && diagramTypes.includes(lang)) {
        const content = codeElement.textContent || '';
        if (content.trim()) {
          blocks.push({
            element: block,
            type: lang,
            content: content.trim()
          });
          return;
        }
      }
    }
    
    // Fallback 2: check if this listing block has a diagram type class
    for (const type of diagramTypes) {
      if (block.classList.contains(type)) {
        if (codeElement) {
          const content = codeElement.textContent || '';
          if (content.trim()) {
            blocks.push({
              element: block,
              type,
              content: content.trim()
            });
          }
        }
        break;
      }
    }
  });
  
  return blocks;
}

// Render a single diagram using Kroki API with caching
async function renderDiagram(type: string, content: string, useCache: boolean = true): Promise<string> {
  try {
    // Create a unique hash for this diagram (type + content)
    const cacheKey = hashContent(type + content);
    
    // Check cache first if enabled
    if (useCache) {
      const cachedSvg = await indexedDBService.getCachedDiagram(cacheKey);
      if (cachedSvg) {
        console.log(`Using cached diagram for ${type} (hash: ${cacheKey})`);
        return cachedSvg;
      }
    }
    
    // Use POST request with plain text body (as per Kroki.io documentation)
    // Note: PlantUML content should INCLUDE @startuml/@enduml tags
    const url = `${KROKI_SERVER}/${type}/svg`;
    
    console.log(`Fetching diagram from Kroki API: ${type}`);
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain',
      },
      body: content
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Kroki API error (${response.status}): ${errorText || response.statusText}`);
    }
    
    const svg = await response.text();
    
    // Cache the successful result
    await indexedDBService.setCachedDiagram(cacheKey, svg);
    
    return svg;
  } catch (error) {
    console.error(`Error rendering ${type} diagram:`, error);
    // Return error placeholder
    return `<div class="kroki-error" style="color: red; padding: 1rem; border: 1px solid red; border-radius: 4px;">
      <strong>Error rendering ${type} diagram</strong><br/>
      ${error instanceof Error ? error.message : 'Unknown error'}
    </div>`;
  }
}

// Main function to find and render all Kroki diagrams in the HTML
export async function renderKrokiDiagrams(container: HTMLElement, useCache: boolean = true): Promise<void> {
  const blocks = extractDiagramBlocks(container);
  
  if (blocks.length === 0) return;
  
  // Render all diagrams in parallel
  const renderPromises = blocks.map(async (block) => {
    const svg = await renderDiagram(block.type, block.content, useCache);
    
    // Create a wrapper div for the rendered diagram
    const wrapper = document.createElement('div');
    wrapper.className = 'imageblock kroki-diagram';
    wrapper.innerHTML = `
      <div class="content">
        ${svg}
      </div>
    `;
    
    // Replace the code block with the rendered diagram
    block.element.replaceWith(wrapper);
  });
  
  await Promise.all(renderPromises);
}

// Clear the Kroki diagram cache
export async function clearKrokiCache(): Promise<void> {
  await indexedDBService.clearDiagramCache();
  console.log('Kroki diagram cache cleared');
}

