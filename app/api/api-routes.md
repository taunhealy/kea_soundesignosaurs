# API Routes and Component Relationships

## Preset Management

### Dashboard View

- Component: `/app/dashboard/presets/page.tsx`

  - Child: `PresetsContent`
    - Child: `PresetCard`

  API Endpoints:

  - 📤 GET `/api/presets?type=uploaded` - Fetch user's uploaded presets
  - 📥 GET `/api/presets?type=downloaded` - Fetch user's downloaded presets

### Individual Preset View

- Component: `/app/presetUploads/[id]/page.tsx`

  - Child: `PresetCard`

  API Endpoints:

  - 🎵 GET `/api/presetUpload/[id]`
  - 💰 GET `/api/presets/[id]/price-history`

### Preset Form

- Component: `/app/components/PresetForm.tsx`

  API Endpoints:

  - 📝 POST `/api/presetUpload`
  - 🎸 GET `/api/genres`
  - 🎹 GET `/api/vsts`
