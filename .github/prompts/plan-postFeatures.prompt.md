# Post Features Implementation Plan

## Overview
This plan outlines the implementation of enhanced post functionality for the avaasa-project.

## Completed Tasks
1. **Slug Generation**
   - Added `slug` field to Post model (unique, generated from title)
   - Implemented pre-save hook using `slugify` package to generate URL-friendly slugs
   - Slug is automatically updated when title changes

2. **Soft Deletes**
   - Added `deletedAt` field to Post model (nullable Date)
   - Modified DELETE route to set `deletedAt` timestamp instead of removing document
   - Updated GET routes to exclude posts where `deletedAt` is not null
   - Maintained ability to restore posts (by setting `deletedAt` to null)

3. **Request Validation**
   - Integrated Joi validation for post creation and update requests
   - Created reusable validation schema in `src/schemas/post.js`
   - Validation ensures title and content are present and are strings
   - Returns 400 error with validation details on failure

4. **Role-Based Access Control**
   - Restricted post creation to regular `user` role only
   - Admins cannot create posts (but can update/delete posts they own)
   - Updated route middleware to use `checkRole(['user'])` for POST endpoint
   - Preserved existing permissions for PUT/DELETE (admins and owners)

5. **Code Organization**
   - Moved Joi validation schema to dedicated schemas folder
   - Created `src/schemas/post.js` for post validation logic
   - Updated imports in `src/routes/posts.js` to use modular schema
   - Fixed ES module import paths with `.js` extension

## Dependencies Added
- `slugify`: ^1.6.9
- `joi`: ^18.3.0

## Files Modified
- `src/models/post.js` - Added slug, deletedAt fields and auto-slug generation
- `src/routes/posts.js` - Added validation, role restrictions, soft delete logic, filtered queries
- `src/schemas/post.js` - New file containing the Joi validation schema

## Testing Verification
- Server starts without errors
- Post creation validates required fields
- Only users with 'user' role can create posts
- Posts are soft-deleted (deletedAt set) instead of removed
- GET requests exclude soft-deleted posts
- Slugs are generated correctly from titles

## Future Enhancements
1. Add slug uniqueness handling (append number on duplicate)
2. Implement restore endpoint for soft-deleted posts
3. Add pagination and filtering to GET endpoints
4. Implement post search by title/content
5. Add post categorization/tagging
6. Implement post publishing status (draft/published)
7. Add comment system for posts