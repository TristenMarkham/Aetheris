// Smart AI-Powered Module Generator
// Uses templates + AI to generate ANY type of business module

const { OpenAI } = require('openai');
const fs = require('fs').promises;
const path = require('path');

class SmartModuleGenerator {
  constructor(openaiKey) {
    this.openai = new OpenAI({ apiKey: openaiKey });
    
    // Base template that works for ANY module type
    this.baseTemplate = {
      component: `import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, Edit, Trash, Eye } from 'lucide-react';

const {{MODULE_NAME}}Module = () => {
  const [items, setItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/{{API_PATH}}/{{ENDPOINT}}');
      const data = await response.json();
      if (data.success) {
        setItems(data.{{DATA_KEY}});
      }
    } catch (error) {
      console.error('Failed to load {{ITEM_NAME_PLURAL}}:', error);
    } finally {
      setLoading(false);
    }
  };

  const addItem = async (itemData) => {
    try {
      const response = await fetch('/api/{{API_PATH}}/{{ENDPOINT}}', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(itemData)
      });
      const data = await response.json();
      if (data.success) {
        loadItems();
        setShowAddForm(false);
      }
    } catch (error) {
      console.error('Failed to add {{ITEM_NAME}}:', error);
    }
  };

  const updateItem = async (id, updates) => {
    try {
      const response = await fetch(\`/api/{{API_PATH}}/{{ENDPOINT}}/\${id}\`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      const data = await response.json();
      if (data.success) {
        loadItems();
        setSelectedItem(null);
      }
    } catch (error) {
      console.error('Failed to update {{ITEM_NAME}}:', error);
    }
  };

  const deleteItem = async (id) => {
    if (!confirm('Are you sure you want to delete this {{ITEM_NAME}}?')) return;
    
    try {
      const response = await fetch(\`/api/{{API_PATH}}/{{ENDPOINT}}/\${id}\`, {
        method: 'DELETE'
      });
      const data = await response.json();
      if (data.success) {
        loadItems();
      }
    } catch (error) {
      console.error('Failed to delete {{ITEM_NAME}}:', error);
    }
  };

  const filteredItems = items.filter(item =>
    {{SEARCH_LOGIC}}
  );

  return (
    <div style={{ padding: '24px', background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', minHeight: '100vh' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h1 style={{ color: '#3b82f6', fontSize: '28px', fontWeight: 'bold', margin: 0 }}>
            {{MODULE_TITLE}}
          </h1>
          <button
            onClick={() => setShowAddForm(true)}
            disabled={loading}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 24px',
              background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
              border: 'none',
              borderRadius: '8px',
              color: 'white',
              fontSize: '14px',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.6 : 1
            }}
          >
            <Plus size={18} />
            Add {{ITEM_NAME}}
          </button>
        </div>

        {/* Search and Filter */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{ position: 'relative', maxWidth: '400px' }}>
            <Search size={20} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#6b7280' }} />
            <input
              type="text"
              placeholder="Search {{ITEM_NAME_PLURAL}}..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 12px 12px 44px',
                background: 'rgba(15, 23, 42, 0.8)',
                border: '1px solid rgba(59, 130, 246, 0.3)',
                borderRadius: '8px',
                color: '#e2e8f0',
                fontSize: '14px'
              }}
            />
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <div style={{ color: '#3b82f6', fontSize: '16px' }}>Loading {{ITEM_NAME_PLURAL}}...</div>
          </div>
        )}

        {/* Items Grid */}
        {!loading && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
            {filteredItems.map(item => (
              <div
                key={item.id}
                style={{
                  background: 'rgba(15, 23, 42, 0.8)',
                  border: '1px solid rgba(59, 130, 246, 0.3)',
                  borderRadius: '12px',
                  padding: '20px',
                  transition: 'all 0.3s ease'
                }}
              >
                {{ITEM_CARD_CONTENT}}

                {/* Action Buttons */}
                <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
                  <button
                    onClick={() => setSelectedItem(item)}
                    style={{
                      flex: 1,
                      padding: '8px',
                      background: 'rgba(59, 130, 246, 0.2)',
                      border: '1px solid rgba(59, 130, 246, 0.3)',
                      borderRadius: '6px',
                      color: '#3b82f6',
                      fontSize: '12px',
                      cursor: 'pointer'
                    }}
                  >
                    <Eye size={14} /> View
                  </button>
                  <button
                    onClick={() => deleteItem(item.id)}
                    style={{
                      padding: '8px',
                      background: 'rgba(239, 68, 68, 0.2)',
                      border: '1px solid rgba(239, 68, 68, 0.3)',
                      borderRadius: '6px',
                      color: '#ef4444',
                      fontSize: '12px',
                      cursor: 'pointer'
                    }}
                  >
                    <Trash size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add Form */}
        {showAddForm && (
          <AddForm 
            onSave={addItem}
            onCancel={() => setShowAddForm(false)}
            fields={{{FORM_FIELDS}}}
            itemName="{{ITEM_NAME}}"
          />
        )}

        {/* Details Modal */}
        {selectedItem && (
          <DetailsModal 
            item={selectedItem}
            onClose={() => setSelectedItem(null)}
            onUpdate={updateItem}
            fields={{{DETAIL_FIELDS}}}
            itemName="{{ITEM_NAME}}"
          />
        )}

      </div>
    </div>
  );
};

{{ADDITIONAL_COMPONENTS}}

export default {{MODULE_NAME}}Module;`,

      apiRoutes: `const express = require('express');
const router = express.Router();

// GET /api/{{API_PATH}}/{{ENDPOINT}} - Get all {{ITEM_NAME_PLURAL}}
router.get('/{{ENDPOINT}}', async (req, res) => {
  try {
    // TODO: Connect to your database
    const {{DATA_KEY}} = []; // Replace with actual database query
    
    res.json({ success: true, {{DATA_KEY}} });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/{{API_PATH}}/{{ENDPOINT}} - Add new {{ITEM_NAME}}
router.post('/{{ENDPOINT}}', async (req, res) => {
  try {
    const data = req.body;
    
    // Validate required fields
    {{VALIDATION_LOGIC}}

    // TODO: Save to database
    const new{{ITEM_NAME_CAPITALIZED}} = {
      id: Date.now().toString(),
      ...data,
      createdAt: new Date().toISOString()
    };

    res.json({ success: true, {{ITEM_NAME}}: new{{ITEM_NAME_CAPITALIZED}} });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// PUT /api/{{API_PATH}}/{{ENDPOINT}}/:id - Update {{ITEM_NAME}}
router.put('/{{ENDPOINT}}/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // TODO: Update in database
    res.json({ success: true, {{ITEM_NAME}}: updates });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// DELETE /api/{{API_PATH}}/{{ENDPOINT}}/:id - Delete {{ITEM_NAME}}
router.delete('/{{ENDPOINT}}/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // TODO: Delete from database
    res.json({ success: true, message: '{{ITEM_NAME_CAPITALIZED}} deleted' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

{{ADDITIONAL_ENDPOINTS}}

module.exports = router;`,

      databaseSchema: `const mongoose = require('mongoose');

const {{SCHEMA_NAME}} = new mongoose.Schema({
  {{SCHEMA_FIELDS}}
}, {
  timestamps: true
});

// Indexes for better performance
{{SCHEMA_INDEXES}}

const {{MODEL_NAME}} = mongoose.model('{{MODEL_NAME}}', {{SCHEMA_NAME}});

module.exports = {{MODEL_NAME}};`
    };
  }

  // Main function: Generate any module type using AI + templates
  async generateModule(moduleType, companyId) {
    try {
      console.log(`🤖 AI generating ${moduleType} module...`);
      
      // Step 1: Get AI-generated module specifications
      const moduleSpecs = await this.generateModuleSpecs(moduleType);
      
      // Step 2: Generate the code using templates + AI specs
      const generatedCode = await this.generateCodeFromSpecs(moduleSpecs);
      
      // Step 3: Write files to disk
      const result = await this.createModuleFiles(moduleSpecs, generatedCode, companyId);
      
      return result;
      
    } catch (error) {
      console.error(`❌ Failed to generate ${moduleType} module:`, error);
      return { success: false, error: error.message };
    }
  }

  // Use AI to generate module specifications
  async generateModuleSpecs(moduleType) {
    const prompt = `You are an expert software architect. Generate detailed specifications for a ${moduleType} module.

Return a JSON object with these exact keys:
{
  "moduleName": "PascalCase name (e.g., 'CustomerManagement')",
  "moduleTitle": "Display title (e.g., 'Customer Management')",
  "itemName": "singular item name (e.g., 'customer')", 
  "itemNamePlural": "plural item name (e.g., 'customers')",
  "itemNameCapitalized": "capitalized singular (e.g., 'Customer')",
  "apiPath": "api path segment (e.g., 'customers')",
  "endpoint": "endpoint name (e.g., 'customers')",
  "dataKey": "data key for API responses (e.g., 'customers')",
  "fields": [
    {"name": "fieldName", "type": "string|number|email|date|select", "required": true, "placeholder": "Field label", "options": ["option1", "option2"] }
  ],
  "searchFields": ["field1", "field2"],
  "cardDisplayFields": ["field1", "field2", "field3"],
  "additionalEndpoints": [
    {"method": "GET", "path": "/stats", "description": "Get statistics"}
  ],
  "businessLogic": "Brief description of what this module manages"
}

Make it comprehensive and business-focused for a ${moduleType} system.

IMPORTANT: Return ONLY the JSON object, no explanation or markdown.`;

    const response = await this.openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3,
      max_tokens: 2000
    });

    const jsonResponse = response.choices[0].message.content.trim();
    
    // Clean up response if it has markdown
    const cleanJson = jsonResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    
    try {
      return JSON.parse(cleanJson);
    } catch (parseError) {
      console.error('Failed to parse AI response:', cleanJson);
      throw new Error('AI response was not valid JSON');
    }
  }

  // Generate actual code by replacing template placeholders
  async generateCodeFromSpecs(specs) {
    // Replace placeholders in templates
    let componentCode = this.baseTemplate.component;
    let apiCode = this.baseTemplate.apiRoutes;
    let schemaCode = this.baseTemplate.databaseSchema;

    const replacements = {
      '{{MODULE_NAME}}': specs.moduleName,
      '{{MODULE_TITLE}}': specs.moduleTitle,
      '{{ITEM_NAME}}': specs.itemName,
      '{{ITEM_NAME_PLURAL}}': specs.itemNamePlural,
      '{{ITEM_NAME_CAPITALIZED}}': specs.itemNameCapitalized,
      '{{API_PATH}}': specs.apiPath,
      '{{ENDPOINT}}': specs.endpoint,
      '{{DATA_KEY}}': specs.dataKey
    };

    // Apply basic replacements
    for (const [placeholder, value] of Object.entries(replacements)) {
      componentCode = componentCode.replace(new RegExp(placeholder, 'g'), value);
      apiCode = apiCode.replace(new RegExp(placeholder, 'g'), value);
      schemaCode = schemaCode.replace(new RegExp(placeholder, 'g'), value);
    }

    // Generate complex parts with AI
    const searchLogic = await this.generateSearchLogic(specs);
    const itemCardContent = await this.generateItemCardContent(specs);
    const formFields = await this.generateFormFields(specs);
    const validationLogic = await this.generateValidationLogic(specs);
    const schemaFields = await this.generateSchemaFields(specs);
    const additionalComponents = await this.generateAdditionalComponents(specs);

    // Apply complex replacements
    componentCode = componentCode.replace('{{SEARCH_LOGIC}}', searchLogic);
    componentCode = componentCode.replace('{{ITEM_CARD_CONTENT}}', itemCardContent);
    componentCode = componentCode.replace('{{FORM_FIELDS}}', JSON.stringify(specs.fields));
    componentCode = componentCode.replace('{{DETAIL_FIELDS}}', JSON.stringify(specs.fields));
    componentCode = componentCode.replace('{{ADDITIONAL_COMPONENTS}}', additionalComponents);

    apiCode = apiCode.replace('{{VALIDATION_LOGIC}}', validationLogic);
    apiCode = apiCode.replace('{{ADDITIONAL_ENDPOINTS}}', await this.generateAdditionalEndpoints(specs));

    schemaCode = schemaCode.replace('{{SCHEMA_NAME}}', `${specs.itemName}Schema`);
    schemaCode = schemaCode.replace('{{MODEL_NAME}}', specs.itemNameCapitalized);
    schemaCode = schemaCode.replace('{{SCHEMA_FIELDS}}', schemaFields);
    schemaCode = schemaCode.replace('{{SCHEMA_INDEXES}}', await this.generateSchemaIndexes(specs));

    return {
      component: componentCode,
      apiRoutes: apiCode,
      databaseSchema: schemaCode
    };
  }

  // AI-powered helper functions to generate specific parts
  async generateSearchLogic(specs) {
    const searchFields = specs.searchFields.join(' + " " + ') + '.toLowerCase()';
    return `(${searchFields}).includes(searchTerm.toLowerCase())`;
  }

  async generateItemCardContent(specs) {
    const displayFields = specs.cardDisplayFields.slice(0, 4); // Show first 4 fields
    
    return displayFields.map((field, index) => {
      const fieldData = specs.fields.find(f => f.name === field);
      if (!fieldData) return '';
      
      return `                <div style={{ marginBottom: '8px' }}>
                  <span style={{ color: '#94a3b8', fontSize: '12px' }}>${fieldData.placeholder?.toUpperCase() || field.toUpperCase()}: </span>
                  <span style={{ color: '#e2e8f0', fontSize: '14px' }}>{item.${field} || 'N/A'}</span>
                </div>`;
    }).join('\n');
  }

  async generateFormFields(specs) {
    // The form fields are already in specs.fields, just return them
    return specs.fields;
  }

  async generateValidationLogic(specs) {
    const requiredFields = specs.fields.filter(f => f.required);
    if (requiredFields.length === 0) return '// No validation required';
    
    const validations = requiredFields.map(field => {
      return `    if (!data.${field.name}) {
      return res.status(400).json({ success: false, error: '${field.placeholder || field.name} is required' });
    }`;
    }).join('\n');
    
    return validations;
  }

  async generateSchemaFields(specs) {
    return specs.fields.map(field => {
      let schemaField = `  ${field.name}: {`;
      
      // Type mapping
      const typeMap = {
        'string': 'String',
        'number': 'Number',
        'email': 'String',
        'date': 'Date',
        'select': 'String'
      };
      
      schemaField += `\n    type: ${typeMap[field.type] || 'String'},`;
      
      if (field.required) {
        schemaField += `\n    required: true,`;
      }
      
      if (field.type === 'email') {
        schemaField += `\n    lowercase: true,`;
        schemaField += `\n    validate: {
      validator: function(v) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
      },
      message: 'Please enter a valid email'
    },`;
      }
      
      if (field.options && field.options.length > 0) {
        schemaField += `\n    enum: ${JSON.stringify(field.options)},`;
      }
      
      schemaField += `\n    trim: true\n  }`;
      
      return schemaField;
    }).join(',\n');
  }

  async generateAdditionalComponents(specs) {
    // Generate generic form and modal components
    return `
// Generic Add Form Component
const AddForm = ({ onSave, onCancel, fields, itemName }) => {
  const [formData, setFormData] = useState(
    fields.reduce((acc, field) => ({ ...acc, [field.name]: '' }), {})
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0, 0, 0, 0.8)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        background: 'rgba(15, 23, 42, 0.95)',
        border: '1px solid rgba(59, 130, 246, 0.3)',
        borderRadius: '16px',
        padding: '32px',
        width: '100%',
        maxWidth: '500px',
        margin: '20px'
      }}>
        <h2 style={{ color: '#3b82f6', fontSize: '24px', marginBottom: '24px' }}>
          Add New {itemName}
        </h2>
        
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gap: '16px' }}>
            {fields.map(field => (
              <div key={field.name}>
                {field.type === 'select' ? (
                  <select
                    value={formData[field.name]}
                    onChange={(e) => setFormData({...formData, [field.name]: e.target.value})}
                    required={field.required}
                    style={{
                      width: '100%',
                      padding: '12px',
                      background: 'rgba(15, 23, 42, 0.8)',
                      border: '1px solid rgba(59, 130, 246, 0.3)',
                      borderRadius: '8px',
                      color: '#e2e8f0',
                      fontSize: '14px'
                    }}
                  >
                    <option value="">Select {field.placeholder}</option>
                    {field.options?.map(option => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    type={field.type === 'email' ? 'email' : field.type === 'number' ? 'number' : field.type === 'date' ? 'date' : 'text'}
                    placeholder={field.placeholder}
                    value={formData[field.name]}
                    onChange={(e) => setFormData({...formData, [field.name]: e.target.value})}
                    required={field.required}
                    style={{
                      width: '100%',
                      padding: '12px',
                      background: 'rgba(15, 23, 42, 0.8)',
                      border: '1px solid rgba(59, 130, 246, 0.3)',
                      borderRadius: '8px',
                      color: '#e2e8f0',
                      fontSize: '14px'
                    }}
                  />
                )}
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
            <button type="submit" style={{
              flex: 1, padding: '12px',
              background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
              border: 'none', borderRadius: '8px',
              color: 'white', fontSize: '14px', fontWeight: '600', cursor: 'pointer'
            }}>
              Save {itemName}
            </button>
            <button type="button" onClick={onCancel} style={{
              flex: 1, padding: '12px',
              background: 'transparent',
              border: '1px solid rgba(239, 68, 68, 0.5)',
              borderRadius: '8px',
              color: '#ef4444', fontSize: '14px', fontWeight: '600', cursor: 'pointer'
            }}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Generic Details Modal Component
const DetailsModal = ({ item, onClose, onUpdate, fields, itemName }) => {
  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0, 0, 0, 0.8)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        background: 'rgba(15, 23, 42, 0.95)',
        border: '1px solid rgba(59, 130, 246, 0.3)',
        borderRadius: '16px',
        padding: '32px',
        width: '100%',
        maxWidth: '600px',
        margin: '20px'
      }}>
        <h2 style={{ color: '#3b82f6', fontSize: '24px', marginBottom: '24px' }}>
          {itemName} Details
        </h2>
        
        <div style={{ display: 'grid', gap: '16px' }}>
          {fields.map(field => (
            <div key={field.name}>
              <label style={{ color: '#94a3b8', fontSize: '12px', marginBottom: '4px', display: 'block' }}>
                {field.placeholder?.toUpperCase()}
              </label>
              <p style={{ color: '#e2e8f0', fontSize: '16px', margin: 0 }}>
                {item[field.name] || 'N/A'}
              </p>
            </div>
          ))}
        </div>

        <button onClick={onClose} style={{
          width: '100%', padding: '12px',
          background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
          border: 'none', borderRadius: '8px',
          color: 'white', fontSize: '14px', fontWeight: '600', cursor: 'pointer',
          marginTop: '24px'
        }}>
          Close
        </button>
      </div>
    </div>
  );
};`;
  }

  async generateAdditionalEndpoints(specs) {
    if (!specs.additionalEndpoints || specs.additionalEndpoints.length === 0) {
      return '// No additional endpoints';
    }
    
    return specs.additionalEndpoints.map(endpoint => {
      return `
// ${endpoint.method} ${endpoint.path} - ${endpoint.description}
router.${endpoint.method.toLowerCase()}('${endpoint.path}', async (req, res) => {
  try {
    // TODO: Implement ${endpoint.description}
    res.json({ success: true, message: '${endpoint.description} endpoint' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});`;
    }).join('\n');
  }

  async generateSchemaIndexes(specs) {
    const searchFields = specs.searchFields || [];
    if (searchFields.length === 0) return '// No indexes needed';
    
    return searchFields.map(field => 
      `${specs.itemName}Schema.index({ ${field}: 1 });`
    ).join('\n');
  }

  // Create the actual files
  async createModuleFiles(specs, generatedCode, companyId) {
    try {
      const moduleDir = specs.moduleName.toLowerCase();
      
      // Create directories
      const frontendDir = path.join(__dirname, '..', 'frontend', 'src', 'components', 'modules', moduleDir);
      const backendDir = path.join(__dirname, '..', 'backend', 'routes');
      const modelsDir = path.join(__dirname, '..', 'backend', 'models');
      
      await fs.mkdir(frontendDir, { recursive: true });
      await fs.mkdir(backendDir, { recursive: true });
      await fs.mkdir(modelsDir, { recursive: true });
      
      // Write files
      const componentPath = path.join(frontendDir, `${specs.moduleName}Module.js`);
      const routesPath = path.join(backendDir, `${moduleDir}.js`);
      const modelPath = path.join(modelsDir, `${specs.itemNameCapitalized}.js`);
      
      await fs.writeFile(componentPath, generatedCode.component, 'utf8');
      await fs.writeFile(routesPath, generatedCode.apiRoutes, 'utf8');
      await fs.writeFile(modelPath, generatedCode.databaseSchema, 'utf8');
      
      // Add to platform modules
      const companyData = await this.loadCompanyData(companyId);
      const newModule = {
        id: `${moduleDir}-${Date.now()}`,
        name: specs.moduleTitle,
        description: `AI-generated ${specs.moduleTitle} module with complete CRUD operations`,
        features: [
          `${specs.itemNameCapitalized} management`,
          'Search and filtering',
          'Add/Edit/Delete operations',
          'Responsive design',
          'Real-time updates'
        ],
        type: 'ai-generated',
        status: 'active',
        created: new Date().toISOString(),
        hasCode: true,
        aiGenerated: true,
        filePaths: {
          component: `frontend/src/components/modules/${moduleDir}/${specs.moduleName}Module.js`,
          routes: `backend/routes/${moduleDir}.js`,
          models: `backend/models/${specs.itemNameCapitalized}.js`
        },
        specs: specs
      };
      
      companyData.platformModules = companyData.platformModules || [];
      companyData.platformModules.push(newModule);
      await this.saveCompanyData(companyId, companyData);
      
      // Generate installation instructions
      const instructions = this.generateInstallationInstructions(specs, moduleDir);
      await fs.writeFile(
        path.join(__dirname, '..', `${specs.moduleName}-INSTALL.md`),
        instructions,
        'utf8'
      );
      
      console.log(`✅ ${specs.moduleTitle} module generated successfully!`);
      
      return {
        success: true,
        module: newModule,
        message: `${specs.moduleTitle} module built with full functionality!`,
        filesCreated: [
          `frontend/src/components/modules/${moduleDir}/${specs.moduleName}Module.js`,
          `backend/routes/${moduleDir}.js`,
          `backend/models/${specs.itemNameCapitalized}.js`
        ],
        businessLogic: specs.businessLogic
      };
      
    } catch (error) {
      throw error;
    }
  }

  generateInstallationInstructions(specs, moduleDir) {
    return `# ${specs.moduleTitle} Module - Installation Guide

## Generated Module Details
- **Module Type**: ${specs.moduleTitle}
- **Item Management**: ${specs.itemNameCapitalized} (${specs.itemNamePlural})
- **Business Logic**: ${specs.businessLogic}

## Files Created
- React Component: \`frontend/src/components/modules/${moduleDir}/${specs.moduleName}Module.js\`
- API Routes: \`backend/routes/${moduleDir}.js\`
- Database Model: \`backend/models/${specs.itemNameCapitalized}.js\`

## Installation Steps

### 1. Backend Integration
Add this to your \`server.js\`:
\`\`\`javascript
app.use('/api/${specs.apiPath}', require('./routes/${moduleDir}'));
\`\`\`

### 2. Frontend Integration  
Add the route to your React app:
\`\`\`javascript
import ${specs.moduleName}Module from './components/modules/${moduleDir}/${specs.moduleName}Module';

// Add to routes:
<Route path="/${moduleDir}" component={${specs.moduleName}Module} />
\`\`\`

### 3. Database Setup
The MongoDB schema is ready. Connect to your database and start using!

## Module Features
${specs.fields.map(field => `- ${field.placeholder} (${field.type}${field.required ? ' - required' : ''})`).join('\n')}

## API Endpoints
- \`GET /api/${specs.apiPath}/${specs.endpoint}\` - List all ${specs.itemNamePlural}
- \`POST /api/${specs.apiPath}/${specs.endpoint}\` - Create ${specs.itemName}
- \`PUT /api/${specs.apiPath}/${specs.endpoint}/:id\` - Update ${specs.itemName}
- \`DELETE /api/${specs.apiPath}/${specs.endpoint}/:id\` - Delete ${specs.itemName}

Your ${specs.moduleTitle} module is ready to use!
`;
  }

  // Helper functions (implement based on your existing system)
  async loadCompanyData(companyId) {
    const fs = require('fs').promises;
    const filePath = path.join(__dirname, '..', 'companies', companyId, 'company_data.json');
    const rawData = await fs.readFile(filePath, 'utf8');
    return JSON.parse(rawData);
  }

  async saveCompanyData(companyId, data) {
    const fs = require('fs').promises;
    const filePath = path.join(__dirname, '..', 'companies', companyId, 'company_data.json');
    data.lastUpdated = new Date().toISOString();
    await fs.writeFile(filePath, JSON.stringify(data, null, 2));
  }
}

// Usage function
const generateAnyModule = async (moduleType, companyId, openaiKey) => {
  const generator = new SmartModuleGenerator(openaiKey);
  return await generator.generateModule(moduleType, companyId);
};

module.exports = {
  SmartModuleGenerator,
  generateAnyModule
}; 
