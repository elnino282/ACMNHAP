# Testing Guide: Create Farm Feature

This guide provides comprehensive testing instructions for the fixed Create Farm feature.

## Prerequisites

1. Backend server running on `http://localhost:8080` (or configured `VITE_API_BASE_URL`)
2. Frontend development server running
3. Valid farmer account credentials
4. Browser developer console open for debugging

## Test Scenarios

### Test 1: Create Farm with Name Only (Minimal Valid Input)

**Steps:**
1. Sign in as a farmer
2. Navigate to Farm Management (should show "No farms found" empty state)
3. Click "Create Farm" button
4. Fill in only the required field:
   - **Farm Name**: `Test Farm 1`
   - Leave **Address ID** empty
   - Leave **Area** empty
5. Click "Create" button

**Expected Results:**
- ✅ Success toast: "Farm created successfully"
- ✅ Dialog closes automatically
- ✅ Farm list refreshes and shows the new farm
- ✅ Console logs show successful creation flow
- ✅ Farm appears with:
  - Name: "Test Farm 1"
  - Area: —
  - Address ID: —
  - Status: Active

**Console Logs to Verify:**
```
[useCreateFarm] Submitting farm data: {name: "Test Farm 1", addressId: null, area: null}
[Farm API Client] Validating payload: ...
[Farm API Client] POST /api/v1/farms
[Farm API Client] Create response status: 200
[useCreateFarm Entity Hook] Mutation success
[useCreateFarm] Success! Created farm: {...}
[useFarms Entity Hook] Query state: {status: "success", ...}
```

---

### Test 2: Create Farm with All Fields

**Steps:**
1. Click "Create Farm" button
2. Fill in all fields:
   - **Farm Name**: `Complete Farm`
   - **Address ID**: `1` (use a valid address ID from your database)
   - **Area**: `25.5`
3. Click "Create" button

**Expected Results:**
- ✅ Success toast: "Farm created successfully"
- ✅ Farm appears with all data populated
- ✅ Area shows: `25.50` (formatted to 2 decimals)
- ✅ Address ID shows: `#1`

---

### Test 3: Duplicate Farm Name (Error Handling)

**Steps:**
1. Click "Create Farm" button
2. Enter a farm name that already exists (e.g., `Test Farm 1`)
3. Click "Create" button

**Expected Results:**
- ✅ Error toast: "Farm name 'Test Farm 1' already exists. Please use a different name."
- ✅ Dialog stays open for correction
- ✅ Form values are preserved
- ✅ Console shows error details with code `ERR_FARM_NAME_EXISTS`

**Console Logs to Verify:**
```
[Farm API Client] Create error: ...
[useCreateFarm] Error occurred: ...
[useCreateFarm] Error response data: {code: "ERR_FARM_NAME_EXISTS", ...}
```

---

### Test 4: Invalid Area Value

**Steps:**
1. Click "Create Farm" button
2. Fill in:
   - **Farm Name**: `Invalid Area Farm`
   - **Area**: `0` or `-5` (invalid values)
3. Try to submit

**Expected Results:**
- ✅ Frontend validation prevents submission
- ✅ Error message: "Area must be greater than 0"
- ✅ No API call is made

---

### Test 5: Invalid Address ID

**Steps:**
1. Click "Create Farm" button
2. Fill in:
   - **Farm Name**: `Test Address Farm`
   - **Address ID**: `99999` (non-existent ID)
3. Click "Create" button

**Expected Results:**
- ✅ Frontend accepts the input (positive integer)
- ✅ Backend returns error (foreign key constraint or not found)
- ✅ Error toast displayed with appropriate message
- ✅ Dialog stays open for correction

---

### Test 6: Form Validation - Empty Name

**Steps:**
1. Click "Create Farm" button
2. Leave **Farm Name** empty
3. Try to submit

**Expected Results:**
- ✅ Frontend validation prevents submission
- ✅ Error message: "Farm name is required"
- ✅ Submit button may be disabled or show validation error

---

### Test 7: Edit Farm (Update with Active Field)

**Steps:**
1. Create a farm successfully
2. Click the menu (⋮) on the farm row
3. Click "Edit"
4. Modify the farm name to `Updated Farm Name`
5. Click "Update" button

**Expected Results:**
- ✅ Success toast: "Farm updated successfully"
- ✅ Dialog closes
- ✅ Farm list refreshes showing updated name
- ✅ Active status remains unchanged

---

### Test 8: Bulk Status Change

**Steps:**
1. Create multiple farms (at least 2)
2. Select farms using checkboxes
3. Use bulk action bar to change status to "Inactive"

**Expected Results:**
- ✅ Success toast: "X farm(s) updated to Inactive"
- ✅ Selected farms show Status badge as "Inactive"
- ✅ Farms remain in the list
- ✅ Backend field `active` is updated to `false`

---

### Test 9: Session Expiration During Create

**Steps:**
1. Sign in as farmer
2. Wait for token to expire OR manually clear localStorage `acm_auth`
3. Try to create a farm

**Expected Results:**
- ✅ Error toast: "Your session has expired. Please sign in again."
- ✅ User redirected to sign-in page (if auto-refresh fails)
- ✅ Console shows 401 error handling

---

### Test 10: Network Error Handling

**Steps:**
1. Stop the backend server
2. Try to create a farm

**Expected Results:**
- ✅ Error toast: "Failed to create farm" with network error description
- ✅ Console shows detailed error logs
- ✅ Dialog stays open
- ✅ Form data is preserved

---

## Backend Testing

### Database Verification

After creating farms, verify in database:

```sql
SELECT farm_id, owner_id, farm_name, address_id, area, active 
FROM farms 
ORDER BY farm_id DESC 
LIMIT 5;
```

**Verify:**
- ✅ `owner_id` matches authenticated user
- ✅ `active` is `true` for new farms
- ✅ `area` stored as `BigDecimal` (e.g., `25.50`)
- ✅ `address_id` is nullable

---

## Console Debugging Checklist

When troubleshooting, check these console log groups:

1. **Feature Layer** (`useCreateFarm`):
   - Submitting farm data
   - Success/Error messages
   - Error response details

2. **Entity Layer** (`useCreateFarm Entity Hook`):
   - Mutation started
   - Mutation success/error
   - Query invalidation

3. **API Client Layer** (`Farm API Client`):
   - Validating payload
   - POST request
   - Response status & data
   - Extracted/transformed data

4. **Query State** (`useFarms Entity Hook`):
   - Query key
   - Query state (status, isLoading, data)
   - Farms count

---

## Known Issues Fixed

1. ✅ **Backend Mapper**: Added `active` field handling in `FarmUpdateRequest`
2. ✅ **Frontend Validation**: Aligned with backend validation rules
3. ✅ **Error Handling**: Enhanced error messages with specific error codes
4. ✅ **Logging**: Comprehensive console logging at all layers
5. ✅ **Cache Invalidation**: Proper query invalidation after mutations
6. ✅ **Optional Fields**: Made `name` optional in update requests for bulk status changes

---

## Success Criteria

All tests pass when:
- ✅ Create farm with minimal data works
- ✅ Create farm with all fields works
- ✅ Duplicate name error is caught and displayed
- ✅ Form validation prevents invalid submissions
- ✅ Farm list auto-refreshes after creation
- ✅ Edit farm works with all field updates
- ✅ Bulk status changes work correctly
- ✅ Error messages are clear and actionable
- ✅ Console logs provide debugging information

---

## Troubleshooting

### Farm not appearing after creation

**Check:**
1. Console for success logs
2. Network tab: POST returned 200/201?
3. Network tab: GET farms request fired after creation?
4. Query invalidation logs present?
5. Database: Farm actually saved?

### Validation errors

**Check:**
1. Frontend schema validation rules
2. Backend `@Valid` annotations
3. Console logs showing validation errors
4. Error toast displaying correct messages

### Session/Auth issues

**Check:**
1. localStorage has `acm_auth` with valid token
2. Authorization header in request headers
3. Backend logs for authentication failures
4. Token expiration time

---

## Next Steps

After all tests pass:
1. Remove excessive console.log statements (optional, keep for debugging)
2. Add unit tests for critical validation logic
3. Document any environment-specific configurations
4. Update API documentation if needed





