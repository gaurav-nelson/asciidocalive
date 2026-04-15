// Kroki diagram rendering utility for browser environments
// Supports PlantUML, Mermaid, GraphViz, Ditaa, and more via Kroki.io API

import { indexedDBService } from './indexedDBService';

const KROKI_SERVER = 'https://kroki.io';

const DIAGRAM_TYPES = [
  'plantuml', 'mermaid', 'graphviz', 'ditaa', 'blockdiag', 'seqdiag',
  'actdiag', 'nwdiag', 'packetdiag', 'rackdiag', 'c4plantuml', 'erd',
  'excalidraw', 'pikchr', 'structurizr', 'vega', 'vegalite', 'wavedrom',
  'bpmn', 'bytefield', 'svgbob', 'd2', 'dbml', 'nomnoml'
];

// Preprocess AsciiDoc source to convert [ditaa], [plantuml], etc. to [source,ditaa]
// so asciidoctor.js produces proper data-lang attributes for diagram detection.
// Handles all common AsciiDoc attribute formats:
//   [ditaa]  [ditaa, "title"]  ["ditaa", "title", "svg"]
//   [plantuml, id, png]  [shaape, "id", "svg", width=80%]
const diagramAttrPattern = new RegExp(
  `^\\[\\s*"?(${DIAGRAM_TYPES.join('|')})"?\\s*([,\\]]|$)`, 'i'
);

export function preprocessDiagramBlocks(source: string): string {
  const lines = source.split('\n');
  const result: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const match = lines[i].match(diagramAttrPattern);
    if (match) {
      const diagramType = match[1].toLowerCase();
      // Rewrite to [source,diagramType] so asciidoctor adds data-lang
      result.push(`[source,${diagramType}]`);
    } else {
      result.push(lines[i]);
    }
  }

  return result.join('\n');
}

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

  const listingBlocks = container.querySelectorAll('.listingblock');

  listingBlocks.forEach((block) => {
    const codeElement = block.querySelector('pre code') || block.querySelector('pre');
    if (!codeElement) return;

    const content = codeElement.textContent || '';
    if (!content.trim()) return;

    // Primary detection: data-lang attribute (set when preprocessDiagramBlocks
    // converts [ditaa] to [source,ditaa] before asciidoctor processes it)
    const lang = codeElement.getAttribute('data-lang');
    if (lang && DIAGRAM_TYPES.includes(lang.toLowerCase())) {
      blocks.push({ element: block, type: lang.toLowerCase(), content: content.trim() });
      return;
    }

    // Fallback: check if the listingblock has a diagram type class
    for (const type of DIAGRAM_TYPES) {
      if (block.classList.contains(type)) {
        blocks.push({ element: block, type, content: content.trim() });
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
        return cachedSvg;
      }
    }
    
    // Use POST request with plain text body (as per Kroki.io documentation)
    // Note: PlantUML content should INCLUDE @startuml/@enduml tags
    const url = `${KROKI_SERVER}/${type}/svg`;
    
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
    // SVG content comes from the Kroki API — same trust boundary as the existing code
    wrapper.innerHTML = `<div class="content">${svg}</div>`;

    // Replace the code block with the rendered diagram
    block.element.replaceWith(wrapper);
  });

  await Promise.all(renderPromises);
}

// Process diagrams in an HTML string and return the updated HTML with rendered diagrams.
// This avoids mutating React-controlled DOM by operating on a detached document.
export async function processKrokiDiagramsInHtml(html: string, useCache: boolean = true): Promise<string> {
  const parser = new DOMParser();
  const doc = parser.parseFromString(`<div id="__kroki_root">${html}</div>`, 'text/html');
  const container = doc.getElementById('__kroki_root')!;

  const blocks = extractDiagramBlocks(container);
  if (blocks.length === 0) return html;

  // Render all diagrams in parallel
  const renderPromises = blocks.map(async (block) => {
    const svg = await renderDiagram(block.type, block.content, useCache);
    const wrapper = doc.createElement('div');
    wrapper.className = 'imageblock kroki-diagram';
    // SVG content comes from the Kroki API — same trust boundary as the existing code
    wrapper.innerHTML = `<div class="content">${svg}</div>`;
    block.element.replaceWith(wrapper);
  });

  await Promise.all(renderPromises);
  return container.innerHTML;
}

// Clear the Kroki diagram cache
export async function clearKrokiCache(): Promise<void> {
  await indexedDBService.clearDiagramCache();
}

