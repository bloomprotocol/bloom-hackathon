# Menu System Overview

This document provides an overview of all menu/navigation components in the Bloom Protocol frontend.

## 1. Main Menu Component (`/components/menu/Menu.tsx`)

The global header menu that appears on all pages. It handles:
- Desktop view: Shows logo + navigation links or user actions
- Mobile view: Shows burger menu icon that triggers different modals based on configuration

### Configuration Options:
- `showProfileBurger: true` - Shows profile-specific menu (used in dashboard, missions)
- `shouldShowNavBurger: true` - Shows standard navigation menu (home, legacy, projects, missions)
- Neither - Shows simple auth button

## 2. Navigation Modals

### 2.1 NavigationModal (`/components/ui/NavigationModal.tsx`)
**Purpose**: Standard navigation menu for most pages
**Triggered by**: Burger menu click when `shouldShowNavBurger = true`
**Content**:
- Home
- Discovery (Projects)
- Legacy  
- Dashboard
- Quick Actions:
  - Connect Wallet (when not authenticated)
  - Follow us on X

### 2.2 ProfileModal (`/components/ui/ProfileModal.tsx`)
**Purpose**: User profile and settings
**Triggered by**: User avatar click or wallet icon click
**Content**:
- User wallet address
- Points balance
- Profile settings
- Logout option

## 3. Page-Specific Mobile Menus

### 3.1 Mission Mobile Menu (`/app/missions/[name]/components/mission-mobile-menu.tsx`)
**Purpose**: Mission-specific navigation and actions
**Triggered by**: Burger menu when `showProfileBurger = true` on mission pages
**Content**:
- Tips (mission completion tips)
- Other Missions (list of other available missions)
- Quick Actions (Dashboard, Invite Friends, Browse Projects)

### 3.2 Dashboard Mobile Sidebar (`/app/(protected)/dashboard/components/sidebar-mobile.tsx`)
**Purpose**: Dashboard navigation and filters
**Triggered by**: Burger menu when `showProfileBurger = true` on dashboard
**Content**:
- Overview
- Mission list
- Bookmarked projects
- Builder/User mode toggle

### 3.3 Create Project Mobile Menu (`/app/(protected)/create-project/components/MobileMenu.tsx`)
**Purpose**: Project creation form navigation
**Content**:
- Form step navigation
- Save draft
- Preview
- Submit actions

## 4. Shared Components

### 4.1 SharedNavigationContent (`/components/ui/SharedNavigationContent.tsx`)
**Purpose**: Reusable navigation content component
**Used by**: NavigationModal and potentially other menus
**Features**:
- Renders menu items with icons
- Handles authentication checks
- Quick actions section
- Active state styling

### 4.2 BaseModal (`/components/ui/BaseModal.tsx`)
**Purpose**: Base modal wrapper for all mobile menus
**Features**:
- Consistent modal styling
- Logo display
- Caption/title
- Close functionality

## 5. Menu Behavior by Route

| Route | Menu Type | Triggered By | Content |
|-------|-----------|--------------|---------|
| `/` | NavigationModal | Burger icon | Standard nav |
| `/legacy` | NavigationModal | Burger icon | Standard nav |
| `/projects` | NavigationModal | Burger icon | Standard nav |
| `/project/[name]` | NavigationModal | Burger icon | Standard nav |
| `/missions/[name]` | NavigationModal* | Burger icon | Standard nav |
| `/dashboard` | Dashboard Sidebar | Burger icon | Dashboard nav |
| `/create-project` | Create Project Menu | Burger icon | Form nav |

*Note: Mission detail page was recently changed from mission-specific menu to standard NavigationModal

## 6. Context Providers

### 6.1 ModalContext (`/lib/context/ModalContext.tsx`)
Manages global modal states including:
- `openNavigationModal()`
- `openProfileModal()`
- `closeAllModals()`

### 6.2 MobileMenuContext (`/lib/context/MobileMenuContext.tsx`)
Manages mobile menu open/close states for page-specific menus

## 7. Key Design Decisions

1. **Separation of Concerns**: Each major section has its own mobile menu with relevant actions
2. **Reusability**: SharedNavigationContent allows consistent navigation rendering
3. **Context-based State**: Modal states managed globally through contexts
4. **Progressive Disclosure**: Mobile menus show only relevant options for current context

## 8. Common Issues and Solutions

### Issue: Confusing naming (e.g., "MobileSidebar" for a modal menu)
**Solution**: Rename components to be more descriptive (e.g., `MissionMobileMenu`)

### Issue: Route not showing expected menu
**Solution**: Check `shouldShowNavBurger` in Menu.tsx includes the route

### Issue: Menu content inconsistency
**Solution**: Use SharedNavigationContent for standard navigation items