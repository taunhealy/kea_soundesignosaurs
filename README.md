# Preset Dashboard Documentation

## Overview
The preset dashboard displays presets based on the user's relationship to them. This document explains how presets are categorized and displayed.

## Preset Types

### 1. Uploaded Presets
Presets that the user has created and uploaded themselves.
- Identified by: `PresetUpload.userId` matching the current user's ID
- These presets appear in the "Uploaded" tab of the dashboard

### 2. Downloaded Presets
Presets that the user has downloaded from other creators.
- Identified by: Records in the `PresetDownload` table where `userId` matches the current user
- Must NOT be the user's own presets
- These presets appear in the "Downloaded" tab of the dashboard

## Database Schema

### Key Models

#### PresetUpload
- `id`: UUID (primary key)
- `userId`: UUID (foreign key to Users)
- `name`: String
- `description`: String
- `fileUrl`: String
- `createdAt`: Timestamp
- `updatedAt`: Timestamp

#### PresetDownload
- `id`: UUID (primary key)
- `userId`: UUID (foreign key to Users)
- `presetUploadId`: UUID (foreign key to PresetUpload)
- `downloadedAt`: Timestamp

## Dashboard Features

### Filtering and Sorting
- Users can filter presets by:
  - Name
  - Date uploaded/downloaded
  - Category
- Sort options include:
  - Most recent
  - Alphabetical
  - Most downloaded

### Actions
- Upload new preset
- Download preset
- Edit preset details (own presets only)
- Delete preset (own presets only)
- Share preset link

## API Endpoints

### Preset Management
- `GET /api/presets/uploaded` - Get user's uploaded presets
- `GET /api/presets/downloaded` - Get user's downloaded presets
- `POST /api/presets` - Upload new preset
- `PUT /api/presets/:id` - Update preset details
- `DELETE /api/presets/:id` - Delete preset

### Downloads
- `POST /api/presets/:id/download` - Download a preset
- `GET /api/presets/:id/download-count` - Get preset download count

## Security Considerations
- Only authenticated users can upload/download presets
- Users can only modify their own presets
- Rate limiting applied to download endpoints
- File type validation on upload