# GameEngineMaker - Visual Programming (GEM-VP)

### The Kernel for ExplicitPrompt

**GEM-VP** is a lightweight, high-performance game engine kernel designed to transform human-readable intent into immediate visual execution. By combining **HTML5 Canvas**, **Forth-inspired logic**, and **WebAssembly**, it serves as the foundational runtime for **ExplicitPrompt**—a language built for speed, clarity, and visual-first development.

---

### Why GEM-VP?

* **ExplicitPrompt Integration:** Designed specifically to parse and execute the ExplicitPrompt language.
* **Performance-First:** Utilizes a minimalist kernel to ensure low-latency rendering and logic.
* **Accessibility by Design:** Structured to be navigable and manageable for developers with TBI or visual impairments.

---

### The Evolution of GEM-VP

GEM-VP is currently a **Functional Prototype** moving toward a **High-Performance Architecture**.

#### **Current Foundation**
* **ExplicitPrompt:** Our custom language designed to reduce cognitive load and provide direct "intent-to-render" results.
* **Forth-Inspired Logic:** A stack-based execution model. This is key for **TBI-friendly development** because it keeps state management predictable and linear.
* **HTML5 Canvas:** Providing the immediate visual feedback loop for all programming.

#### **The Roadmap (Future Goals)**
* **WebAssembly (WASM) Migration:** Rebuilding the core kernel in WASM for near-native execution speeds.
* **The "Infinite Canvas":** Transitioning from a flat 2D space to a **True 3D Environment** using **WebGL/Three.js**. This "Infinite Space" allows for spatial programming and unrestricted visual creativity.

---

### **Current Sprint: Finishing Touches (2D Stage)**
Before migrating to the 3D "Infinite Space," we are finalizing the core stability of the 2D environment:

* **Console Log UI Refinement:** Implementing "Save" and "Clear" functionality for the console log.
* **Interface Cleanup:** Removing redundant buttons to streamline the workspace for better accessibility.
* **Stage Visualization:** Adding grid coordinates directly onto the "Stage" to assist with spatial orientation.
* **State Management:** Finalizing the "Save Total Game State" and "Load" features.
* **Forth Namespace/Dictionary:** Clarifying the dictionary structure as distinct from the "Deck" (cards available for "Hands").

---

### **Project Structure**

* **`index.html`**: The primary entry point and visual interface for the **GEM-VP** stage.
* **`js/`**:
    * **`kernel.js`**: The core execution engine handling the **Forth-inspired dictionary** and state.
    * **`interpreter.js`**: The parser for **ExplicitPrompt**, translating human intent into kernel commands.
    * **`renderer.js`**: Current **HTML5 Canvas** logic.
* **`assets/`**: Storage for visual entities, cards, and "Deck" configurations.


https://www.youtube.com/watch?v=WPtdS3mgIRE 
...
https://www.youtube.com/watch?v=A9UQYf2s5Vg 





