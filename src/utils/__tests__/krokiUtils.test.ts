import { describe, it, expect } from 'vitest';
import { preprocessDiagramBlocks } from '../krokiUtils';

describe('preprocessDiagramBlocks', () => {
  it('converts [plantuml] to [source,plantuml]', () => {
    const input = '[plantuml]\n----\n@startuml\nAlice -> Bob\n@enduml\n----';
    const result = preprocessDiagramBlocks(input);
    expect(result).toContain('[source,plantuml]');
    expect(result).not.toContain('[plantuml]');
  });

  it('converts [mermaid] to [source,mermaid]', () => {
    const input = '[mermaid]\n----\ngraph TD\nA-->B\n----';
    const result = preprocessDiagramBlocks(input);
    expect(result).toContain('[source,mermaid]');
  });

  it('converts [ditaa] to [source,ditaa]', () => {
    const input = '[ditaa]\n----\n+--+\n|  |\n+--+\n----';
    const result = preprocessDiagramBlocks(input);
    expect(result).toContain('[source,ditaa]');
  });

  it('is case-insensitive', () => {
    const input = '[PlantUML]\n----\n@startuml\n@enduml\n----';
    const result = preprocessDiagramBlocks(input);
    expect(result).toContain('[source,plantuml]');
  });

  it('handles quoted diagram type', () => {
    const input = '["plantuml", "title"]\n----\n@startuml\n@enduml\n----';
    const result = preprocessDiagramBlocks(input);
    expect(result).toContain('[source,plantuml]');
  });

  it('handles diagram type with attributes', () => {
    const input = '[plantuml, id, png]\n----\n@startuml\n@enduml\n----';
    const result = preprocessDiagramBlocks(input);
    expect(result).toContain('[source,plantuml]');
  });

  it('leaves non-diagram blocks unchanged', () => {
    const input = '[source,java]\n----\npublic class Foo {}\n----';
    const result = preprocessDiagramBlocks(input);
    expect(result).toBe(input);
  });

  it('leaves regular text unchanged', () => {
    const input = 'This is a paragraph.\n\n== Heading\n\nMore text.';
    const result = preprocessDiagramBlocks(input);
    expect(result).toBe(input);
  });

  it('handles multiple diagram blocks', () => {
    const input = '[plantuml]\n----\n@startuml\n@enduml\n----\n\n[mermaid]\n----\ngraph TD\n----';
    const result = preprocessDiagramBlocks(input);
    expect(result).toContain('[source,plantuml]');
    expect(result).toContain('[source,mermaid]');
  });

  it('handles all supported diagram types', () => {
    const types = ['plantuml', 'mermaid', 'graphviz', 'ditaa', 'blockdiag', 'd2', 'nomnoml'];
    for (const type of types) {
      const input = `[${type}]\n----\ncontent\n----`;
      const result = preprocessDiagramBlocks(input);
      expect(result).toContain(`[source,${type}]`);
    }
  });
});
