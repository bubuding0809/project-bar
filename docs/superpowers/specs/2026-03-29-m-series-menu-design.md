# M-Series Screens: Mobile Menu Flow

## Scope
Implementation of the Mobile Menu Flow screens (M1 to M5) for a web application mimicking a mobile app interface.

## Target Platform & Tech Stack
- **Viewport:** Mobile-focused UI layout (max-width container, centered)
- **Framework:** Next.js + React
- **Styling:** Tailwind CSS + shadcn/ui components
- **Icons:** `lucide-react`

## Screens & Component Breakdown

### 1. [M1] Main Menu
**Purpose:** Browse available menu items grouped by categories, and manage the current cart status.
- **Components:**
  - **Header:** Sticky top header with "Search" icon button (using shadcn `Button` variant="ghost" or icon only).
  - **Category Tabs:** Scrollable horizontal container holding category pills (e.g., Cocktails, Food Menu, Promotions).
  - **Menu List:** A vertical list of items utilizing a generic `MenuItem` component that maps to the new `Component/Menu Item` from the design file.
    - `MenuItem`: Displays item title, optional description, price, thumbnail image, and a floating "+" button to add it to the cart.
  - **Floating Action Button (Cart):** A sticky button displaying the total items in the cart and the total cost.
  - **Bottom Navigation:** Fixed bottom bar with 4 standard nav icons.

### 2. [M2] Item Detail
**Purpose:** View details of a specific item, customize options (like Ice/Sugar levels), and add it to the cart.
- **Components:**
  - **Top Bar:** Back button to return to M1 (`Button` variant="ghost").
  - **Hero Image:** Large image banner at the top.
  - **Details:** Title, Price, Description text.
  - **Customization Selectors:** `RadioGroup` or styled selectable chips for "Ice Level" and "Sugar Level".
  - **Sticky Action Footer:** A fixed bottom `Button` ("Add to Cart — $X.XX").

### 3. [M3] Cart
**Purpose:** Review selected items before submitting them to the table's tab.
- **Components:**
  - **Top Bar:** "Your Tab" title and table number identifier.
  - **Cart Item List:** Rows of added items with quantities and subtotal price.
  - **Totals Section:** "Total (inc. GST)" summary row.
  - **Information Alert:** A muted `Card` explaining that orders are submitted now, but payment happens at the end of the night.
  - **Sticky Action Footer:** A fixed bottom `Button` ("Submit Order to Tab").

### 4. [M4] Payment
**Purpose:** Select the payment method that will be automatically charged at the end of the night.
- **Components:**
  - **Top Bar:** "Settle Tab" title.
  - **Cost Breakdown:** Summary of total charges.
  - **Payment Options:**
    - Large CTA button for primary wallet payment (e.g., Apple Pay).
    - Muted styled `Card` displaying the saved credit card on file (e.g., VISA ending in 4242).
  - **Information Alert:** A muted `Card` explaining the auto-charge process.

### 5. [M5] Confirmed
**Purpose:** Success state confirming the order was submitted to the tab.
- **Components:**
  - **Status Icon:** Large rounded circle with a Check icon (`lucide-react`).
  - **Status Text:** "Order Submitted" title with description text.
  - **Action:** A `Button` centered at the bottom to "Back to Menu".

## State Management Approach (Proposed)
- **Cart State:** Needs a global store (e.g., React Context or Zustand) to track items, quantities, selected customizations (ice/sugar), and total cost across M1, M2, and M3.
- **Navigation:** Standard Next.js routing (or a single-page step flow component depending on the backend integration setup).

## Open Questions / Future Implementation Details
- *Mock Data vs API:* For this phase, we will build out the UI using mock data representing the items visible in the `.pen` file.

---
**Status:** Pending User Approval
