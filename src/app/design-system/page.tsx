import React from "react";

export default function DesignSystemDemo() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="ds-text-heading-1 text-center">Design System Demo</h1>

        {/* Typography Section */}
        <div className="ds-card">
          <div className="ds-card-header">
            <h2 className="ds-text-heading-2">Typography</h2>
          </div>
          <div className="ds-card-body space-y-4">
            <div>
              <h1 className="ds-text-heading-1">Heading 1</h1>
              <h2 className="ds-text-heading-2">Heading 2</h2>
              <h3 className="ds-text-heading-3">Heading 3</h3>
              <p className="ds-text-body">
                Body text - Lorem ipsum dolor sit amet
              </p>
              <p className="ds-text-body-secondary">Secondary body text</p>
              <p className="ds-text-caption">Caption text</p>
              <label className="ds-label">Label text</label>
            </div>
          </div>
        </div>

        {/* Button Section */}
        <div className="ds-card">
          <div className="ds-card-header">
            <h2 className="ds-text-heading-2">Buttons</h2>
          </div>
          <div className="ds-card-body">
            <div className="flex flex-wrap gap-4">
              <button className="ds-button-primary">Primary Button</button>
              <button className="ds-button-secondary">Secondary Button</button>
              <button className="ds-button-success">Success Button</button>
              <button className="ds-button-outline">Outline Button</button>
              <button className="ds-button-ghost">Ghost Button</button>
              <button className="ds-button-primary" disabled>
                Disabled
              </button>
            </div>
          </div>
        </div>

        {/* Badge Section */}
        <div className="ds-card">
          <div className="ds-card-header">
            <h2 className="ds-text-heading-2">Badges</h2>
          </div>
          <div className="ds-card-body">
            <div className="flex flex-wrap gap-4">
              <span className="ds-badge-priority-emergency">Emergência</span>
              <span className="ds-badge-priority-intermediate">
                Intermediário
              </span>
              <span className="ds-badge-priority-normal">Normal</span>
              <span className="ds-badge">Default Badge</span>
            </div>
          </div>
        </div>

        {/* Form Section */}
        <div className="ds-card">
          <div className="ds-card-header">
            <h2 className="ds-text-heading-2">Form Elements</h2>
          </div>
          <div className="ds-card-body">
            <div className="space-y-4 max-w-md">
              <div className="ds-form-group">
                <label className="ds-label">Name</label>
                <input className="ds-input" placeholder="Enter your name" />
              </div>
              <div className="ds-form-group">
                <label className="ds-label">Email</label>
                <input
                  className="ds-input"
                  type="email"
                  placeholder="Enter your email"
                />
              </div>
              <div className="ds-form-group">
                <label className="ds-label">Disabled Input</label>
                <input className="ds-input" disabled value="This is disabled" />
              </div>
            </div>
          </div>
        </div>

        {/* Card Variations */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="ds-card">
            <div className="ds-card-header">
              <h3 className="ds-text-heading-3">Card with Header</h3>
            </div>
            <div className="ds-card-body">
              <p className="ds-text-body">This card has a header section.</p>
            </div>
          </div>

          <div className="ds-card">
            <div className="ds-card-body">
              <h3 className="ds-text-heading-3 mb-4">Card without Header</h3>
              <p className="ds-text-body">This card only has a body section.</p>
            </div>
            <div className="ds-card-footer">
              <button className="ds-button-primary">Action</button>
            </div>
          </div>
        </div>

        {/* Interactive Demo */}
        <div className="ds-card">
          <div className="ds-card-header">
            <h2 className="ds-text-heading-2">Interactive Demo</h2>
          </div>
          <div className="ds-card-body">
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <span className="ds-badge-priority-emergency">
                  High Priority
                </span>
                <button className="ds-button-success">Complete Task</button>
                <button className="ds-button-outline">Cancel</button>
              </div>
              <div className="ds-form-group">
                <label className="ds-label">Quick Action</label>
                <div className="flex gap-2">
                  <input
                    className="ds-input flex-1"
                    placeholder="Enter a command"
                  />
                  <button className="ds-button-primary">Execute</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
