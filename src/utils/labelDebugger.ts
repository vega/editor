import {View} from 'vega';

// Define interfaces for Bitmap and LabelTransform
interface Bitmap {
  w: number;
  h: number;
  array: Uint32Array;
  name: string;
}

interface LabelTransform {
  bitmaps: Bitmap[];
}

export class LabelDebugger {
  private view: View;

  constructor(view: View) {
    this.view = view;
  }

  public visualizeBitmap() {
    console.log('Visualizing bitmap');
    console.log('View:', this.view);
    console.log('View runtime:', this.view['_runtime']);

    const dataflow = this.view;

    if (!dataflow || !dataflow['_runtime'] || !dataflow['_runtime'].nodes) {
      console.error('Nodes not found in the view.');
      return;
    }

    console.log('Nodes:', dataflow['_runtime'].nodes);

    // Find the Label transform node
    const labelTransformNodes = Object.values(dataflow['_runtime'].nodes).filter(
      (node: any) => node.constructor.name === 'Label',
    ) as LabelTransform[];

    if (!labelTransformNodes) {
      console.error('No Label transform found in the dataflow.');
      return;
    }

    console.log('Label transform found:', labelTransformNodes);

    const bitmaps = labelTransformNodes.flatMap((labelTransformNode) => labelTransformNode.bitmaps);
    if (!bitmaps || bitmaps.length === 0) {
      console.error('No bitmaps found in the Label transform.');
      return;
    }

    const renderBitmap = (bitmap: Bitmap) => {
      this.renderBitmap(bitmap);
    };

    if (bitmaps.length === 1) {
      renderBitmap(bitmaps[0]);
    } else {
      this.displayBitmapSelection(bitmaps, renderBitmap);
    }
  }

  private renderBitmap(bitmap: Bitmap) {
    let w = bitmap.w;
    let h = bitmap.h;

    console.log('Bitmap dimensions:', w, h);
    console.log('Type of w:', typeof w);
    console.log('Type of h:', typeof h);

    // Ensure w and h are valid integers
    w = parseInt(w.toString(), 10);
    h = parseInt(h.toString(), 10);

    if (!w || !h || isNaN(w) || isNaN(h)) {
      console.error('Invalid bitmap dimensions:', w, h);
      return;
    }

    // Create a canvas element
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    canvas.style.border = '1px solid black';
    canvas.style.display = 'block';
    canvas.style.width = '100%';
    canvas.style.height = 'calc(100% - 50px)'; // Adjust for header and buttons

    // Get the drawing context
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      console.error('Failed to get 2D context from canvas');
      return;
    }
    const imageData = ctx.createImageData(w, h);
    const data = imageData.data;

    // Access the bitmap array
    const bitmapArray = bitmap.array;

    // Render the bitmap onto the canvas
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const index = y * w + x;
        const arrayIndex = index >>> 5; // index / 32
        const bitPosition = index & 31; // index % 32
        const bitSet = (bitmapArray[arrayIndex] & (1 << bitPosition)) !== 0;

        const pixelIndex = (y * w + x) * 4; // Each pixel uses 4 array entries (RGBA)
        if (bitSet) {
          // Occupied pixel (e.g., label position), set to black
          data[pixelIndex] = 0; // Red
          data[pixelIndex + 1] = 0; // Green
          data[pixelIndex + 2] = 0; // Blue
          data[pixelIndex + 3] = 255; // Alpha (fully opaque)
        } else {
          // Free pixel, set to white
          data[pixelIndex] = 255;
          data[pixelIndex + 1] = 255;
          data[pixelIndex + 2] = 255;
          data[pixelIndex + 3] = 255;
        }
      }
    }

    // Put the image data onto the canvas
    ctx.putImageData(imageData, 0, 0);

    console.log('Bitmap canvas created');

    // Create a modal to display the canvas
    const modal = document.createElement('div');
    modal.style.cssText = `
      position: fixed;
      top: 80px;
      right: 50px;
      left: auto;
      background: rgba(255, 255, 255, 0.95);
      border: 1px solid black;
      padding: 10px;
      z-index: 1002;
      max-height: 90%;
      overflow: auto;
      resize: both;
      width: ${w + 20}px;
      height: ${h + 80}px;
      box-sizing: border-box;
    `;

    // Make the modal draggable
    this.makeElementDraggable(modal);

    // Adjust the canvas size to fit within the modal
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`; // Adjust for header and buttons

    // Add the canvas to the modal
    modal.appendChild(canvas);

    // Create a close button
    const closeButton = document.createElement('button');
    closeButton.textContent = 'Close';
    closeButton.style.display = 'block';
    closeButton.style.marginTop = '10px';
    closeButton.onclick = () => document.body.removeChild(modal);
    modal.appendChild(closeButton);

    // Append the modal to the document body
    document.body.appendChild(modal);
    console.log('Bitmap visualization modal added to document body');
  }

  private displayBitmapSelection(bitmaps: Bitmap[], renderBitmapCallback: (bitmap: Bitmap) => void) {
    // Create a modal for bitmap selection
    const selectionModal = document.createElement('div');
    selectionModal.style.cssText = `
      position: fixed;
      top: 100px;
      left: 100px;
      background: rgba(255, 255, 255, 0.95);
      border: 1px solid black;
      padding: 20px;
      z-index: 1001;
      max-height: 90%;
      overflow: auto;
    `;

    const title = document.createElement('h3');
    title.textContent = 'Select a Bitmap to Visualize';
    selectionModal.appendChild(title);

    // Create a list of bitmaps with radio buttons
    const form = document.createElement('form');
    bitmaps.forEach((bitmap, index) => {
      const label = document.createElement('label');
      label.style.display = 'block';
      const radio = document.createElement('input');
      radio.type = 'radio';
      radio.name = 'bitmapSelection';
      radio.value = index.toString();
      if (index === 0) radio.checked = true; // Default to the first bitmap
      label.appendChild(radio);
      label.appendChild(document.createTextNode(`${bitmap.name}`));
      form.appendChild(label);
    });

    selectionModal.appendChild(form);

    // Create a container for buttons
    const buttonContainer = document.createElement('div');
    buttonContainer.style.marginTop = '10px';

    // Create a button to confirm selection
    const selectButton = document.createElement('button');
    selectButton.textContent = 'Visualize';
    selectButton.onclick = () => {
      const selectedOption = form.querySelector('input[name="bitmapSelection"]:checked') as HTMLInputElement;
      if (selectedOption) {
        const selectedIndex = parseInt(selectedOption.value, 10);
        console.log('Selected index:', selectedIndex);
        const selectedBitmap = bitmaps[selectedIndex];
        console.log('Selected bitmap:', selectedBitmap);
        renderBitmapCallback(selectedBitmap);
      } else {
        console.error('No bitmap selected');
      }
    };

    // Create a close button
    const closeButton = document.createElement('button');
    closeButton.textContent = 'Close';
    closeButton.onclick = () => {
      document.body.removeChild(selectionModal);
    };

    // Add buttons to the container
    buttonContainer.appendChild(selectButton);
    buttonContainer.appendChild(closeButton);

    // Add some space between buttons
    closeButton.style.marginTop = '10px';

    // Add the button container to the modal
    selectionModal.appendChild(buttonContainer);

    // Append the modal to the document body
    document.body.appendChild(selectionModal);
  }

  private makeElementDraggable(element: HTMLElement) {
    let isDragging = false;
    let startX: number, startY: number, startLeft: number, startTop: number;

    // Create a header bar for dragging
    const header = document.createElement('div');
    header.style.cssText = `
      width: 100%;
      height: 20px;
      background: #ddd;
      cursor: move;
      position: absolute;
      top: 0;
      left: 0;
    `;
    element.appendChild(header);
    element.style.position = 'fixed';
    element.style.top = element.style.top || '50px';
    element.style.left = element.style.left || 'auto';
    element.style.right = element.style.right || '50px';
    element.style.paddingTop = '30px';

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      startX = e.clientX;
      startY = e.clientY;
      startLeft = element.offsetLeft;
      startTop = element.offsetTop;
      e.preventDefault();
    };

    const onMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        const dx = e.clientX - startX;
        const dy = e.clientY - startY;
        element.style.left = `${startLeft + dx}px`;
        element.style.top = `${startTop + dy}px`;
        element.style.right = 'auto'; // Remove right positioning
      }
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    header.addEventListener('mousedown', onMouseDown);
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);

    // Clean up event listeners when element is removed
    element.addEventListener('DOMNodeRemoved', () => {
      header.removeEventListener('mousedown', onMouseDown);
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    });
  }
}
