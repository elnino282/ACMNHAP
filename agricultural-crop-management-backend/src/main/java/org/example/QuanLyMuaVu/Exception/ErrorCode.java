package org.example.QuanLyMuaVu.Exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
public enum ErrorCode {

        // Generic / common
        UNCATEGORIZED_EXCEPTION("ERR_UNCATEGORIZED_EXCEPTION", "Uncategorized error", HttpStatus.INTERNAL_SERVER_ERROR),
        KEY_INVALID("ERR_KEY_INVALID", "Invalid key", HttpStatus.BAD_REQUEST),

        INTERNAL_SERVER_ERROR("ERR_INTERNAL_SERVER_ERROR", "Internal server error", HttpStatus.INTERNAL_SERVER_ERROR),
        BAD_REQUEST("ERR_BAD_REQUEST", "Bad request", HttpStatus.BAD_REQUEST),
        UNAUTHORIZED("ERR_UNAUTHORIZED", "Unauthorized", HttpStatus.UNAUTHORIZED),
        FORBIDDEN("ERR_FORBIDDEN", "Forbidden", HttpStatus.FORBIDDEN),
        RESOURCE_NOT_FOUND("ERR_RESOURCE_NOT_FOUND", "Resource not found", HttpStatus.NOT_FOUND),
        DUPLICATE_RESOURCE("ERR_DUPLICATE_RESOURCE", "Resource already exists", HttpStatus.CONFLICT),
        UNAUTHENTICATED("ERR_UNAUTHENTICATED", "Unauthenticated", HttpStatus.UNAUTHORIZED),

        // User errors
        USERNAME_BLANK("ERR_USERNAME_BLANK", "Username must not be blank", HttpStatus.BAD_REQUEST),
        PASSWORD_BLANK("ERR_PASSWORD_BLANK", "Password must not be blank", HttpStatus.BAD_REQUEST),
        PASSWORD_INVALID("ERR_PASSWORD_INVALID", "Password must be at least 8 characters", HttpStatus.BAD_REQUEST),

        USER_NOT_FOUND("ERR_USER_NOT_FOUND", "User not found", HttpStatus.NOT_FOUND),
        USER_EXISTED("ERR_USER_EXISTED", "User already exists", HttpStatus.BAD_REQUEST),
        USER_NOT_EXISTED("ERR_USER_NOT_EXISTED", "User does not exist", HttpStatus.NOT_FOUND),
        USERNAME_ALREADY_EXISTS("ERR_USERNAME_ALREADY_EXISTS", "Username is already in use", HttpStatus.CONFLICT),
        INVALID_CREDENTIALS("ERR_INVALID_CREDENTIALS", "Invalid username or password", HttpStatus.UNAUTHORIZED),
        EMAIL_ALREADY_EXISTS("ERR_EMAIL_ALREADY_EXISTS", "Email is already in use", HttpStatus.CONFLICT),
        USER_HAS_ASSOCIATED_DATA("ERR_USER_HAS_ASSOCIATED_DATA",
                        "Cannot delete user: they have associated farms or data", HttpStatus.CONFLICT),

        // Farm / Plot errors
        PLOT_NOT_FOUND("ERR_PLOT_NOT_FOUND", "Plot not found", HttpStatus.NOT_FOUND),
        PLOT_NAME_EXISTS("ERR_PLOT_NAME_EXISTS", "Plot name already exists", HttpStatus.CONFLICT),
        INVALID_PLOT_AREA("ERR_INVALID_PLOT_AREA", "Plot area must be greater than 0", HttpStatus.BAD_REQUEST),
        PLOT_STATUS_NOT_FOUND("ERR_PLOT_STATUS_NOT_FOUND", "Plot status not found", HttpStatus.NOT_FOUND),

        FARM_NOT_FOUND("ERR_FARM_NOT_FOUND", "Farm not found", HttpStatus.NOT_FOUND),
        FARM_NAME_EXISTS("ERR_FARM_NAME_EXISTS", "Farm name already exists", HttpStatus.CONFLICT),
        FARM_HAS_CHILD_RECORDS("ERR_FARM_HAS_CHILD_RECORDS", "Cannot delete farm with related plots or seasons",
                        HttpStatus.BAD_REQUEST),
        PLOT_HAS_ACTIVE_SEASONS("ERR_PLOT_HAS_ACTIVE_SEASONS",
                        "Cannot delete plot because it has active or planned seasons", HttpStatus.BAD_REQUEST),

        // Crop / Season errors
        CROP_NOT_FOUND("ERR_CROP_NOT_FOUND", "Crop not found", HttpStatus.NOT_FOUND),
        INVALID_PLANTING_DATES("ERR_INVALID_PLANTING_DATES", "Planting date must be before or equal to harvest date",
                        HttpStatus.BAD_REQUEST),
        PLOT_FULL("ERR_PLOT_FULL", "Plot has no remaining capacity", HttpStatus.BAD_REQUEST),

        SEASON_NOT_FOUND("ERR_SEASON_NOT_FOUND", "Season not found", HttpStatus.NOT_FOUND),
        INVALID_SEASON_DATES("ERR_INVALID_SEASON_DATES", "Season start date must be before end date",
                        HttpStatus.BAD_REQUEST),
        SEASON_OVERLAP("ERR_SEASON_OVERLAP", "Season dates overlap with an existing season on the same plot",
                        HttpStatus.BAD_REQUEST),
        INVALID_SEASON_STATUS_TRANSITION("ERR_INVALID_SEASON_STATUS_TRANSITION", "Invalid season status transition",
                        HttpStatus.BAD_REQUEST),
        SEASON_HAS_CHILD_RECORDS("ERR_SEASON_HAS_CHILD_RECORDS",
                        "Cannot delete season with related harvests, expenses or sales", HttpStatus.BAD_REQUEST),

        // Harvest errors
        HARVEST_NOT_FOUND("ERR_HARVEST_NOT_FOUND", "Harvest not found", HttpStatus.NOT_FOUND),
        INVALID_HARVEST_QUANTITY("ERR_INVALID_HARVEST_QUANTITY", "Invalid harvest quantity", HttpStatus.BAD_REQUEST),
        HARVEST_DATE_BEFORE_PLANTING("ERR_HARVEST_DATE_BEFORE_PLANTING", "Harvest date cannot be before planting date",
                        HttpStatus.BAD_REQUEST),

        // Task / field log / expense / quality errors (season operations)
        TASK_NOT_FOUND("ERR_TASK_NOT_FOUND", "Task not found", HttpStatus.NOT_FOUND),
        INVALID_TASK_STATUS_TRANSITION("ERR_INVALID_TASK_STATUS_TRANSITION", "Invalid task status transition",
                        HttpStatus.BAD_REQUEST),
        SEASON_CLOSED_CANNOT_ADD_TASK("ERR_SEASON_CLOSED_CANNOT_ADD_TASK", "Cannot add task to closed season",
                        HttpStatus.BAD_REQUEST),
        SEASON_CLOSED_CANNOT_MODIFY_TASK("ERR_SEASON_CLOSED_CANNOT_MODIFY_TASK", "Cannot modify task of closed season",
                        HttpStatus.BAD_REQUEST),

        FIELD_LOG_NOT_FOUND("ERR_FIELD_LOG_NOT_FOUND", "Field log not found", HttpStatus.NOT_FOUND),
        SEASON_CLOSED_CANNOT_ADD_FIELD_LOG("ERR_SEASON_CLOSED_CANNOT_ADD_FIELD_LOG",
                        "Cannot add field log to closed season", HttpStatus.BAD_REQUEST),
        SEASON_CLOSED_CANNOT_MODIFY_FIELD_LOG("ERR_SEASON_CLOSED_CANNOT_MODIFY_FIELD_LOG",
                        "Cannot modify field log of closed season", HttpStatus.BAD_REQUEST),

        INCIDENT_NOT_FOUND("ERR_INCIDENT_NOT_FOUND", "Incident not found", HttpStatus.NOT_FOUND),
        INVALID_INCIDENT_STATUS_TRANSITION("ERR_INVALID_INCIDENT_STATUS_TRANSITION",
                        "Invalid incident status transition", HttpStatus.BAD_REQUEST),
        INVALID_DEADLINE("ERR_INVALID_DEADLINE",
                        "Deadline must be today or later", HttpStatus.BAD_REQUEST),
        OPTIMISTIC_LOCK_ERROR("ERR_OPTIMISTIC_LOCK_ERROR",
                        "Record was modified by another user. Please reload and try again", HttpStatus.CONFLICT),

        EXPENSE_NOT_FOUND("ERR_EXPENSE_NOT_FOUND", "Expense not found", HttpStatus.NOT_FOUND),
        EXPENSE_PERIOD_LOCKED("ERR_EXPENSE_PERIOD_LOCKED", "Expenses cannot be modified in a closed or locked season",
                        HttpStatus.BAD_REQUEST),

        LOT_HAS_LINKED_ORDERS_OR_QC("ERR_LOT_HAS_LINKED_ORDERS_OR_QC",
                        "Cannot delete harvest lot with linked orders or quality results", HttpStatus.BAD_REQUEST),

        // Address / Location errors
        PROVINCE_NOT_FOUND("ERR_PROVINCE_NOT_FOUND", "Province not found", HttpStatus.NOT_FOUND),
        PROVINCE_REQUIRED("ERR_PROVINCE_REQUIRED", "Province is required when creating a farm", HttpStatus.BAD_REQUEST),
        WARD_NOT_FOUND("ERR_WARD_NOT_FOUND", "Ward not found", HttpStatus.NOT_FOUND),
        WARD_REQUIRED("ERR_WARD_REQUIRED", "Ward is required when creating a farm", HttpStatus.BAD_REQUEST),
        WARD_NOT_IN_PROVINCE("ERR_WARD_NOT_IN_PROVINCE", "Ward does not belong to the specified province",
                        HttpStatus.BAD_REQUEST),
        ADDRESS_IMPORT_FAILED("ERR_ADDRESS_IMPORT_FAILED", "Failed to import address data",
                        HttpStatus.INTERNAL_SERVER_ERROR),

        // Admin Farm Management errors
        INVALID_FARM_OWNER_ROLE("ERR_INVALID_FARM_OWNER_ROLE",
                        "User is not a valid Farmer. Only users with FARMER role can own farms.",
                        HttpStatus.BAD_REQUEST),

        // Crop/Variety deletion guards
        CROP_HAS_SEASONS("ERR_CROP_HAS_SEASONS",
                        "Cannot delete this crop because it is referenced in an active or past Season.",
                        HttpStatus.CONFLICT),
        CROP_HAS_VARIETIES("ERR_CROP_HAS_VARIETIES",
                        "Cannot delete this crop because it has associated varieties. Delete all varieties first.",
                        HttpStatus.CONFLICT),
        VARIETY_HAS_SEASONS("ERR_VARIETY_HAS_SEASONS",
                        "Cannot delete this variety because it is referenced in an active or past Season.",
                        HttpStatus.CONFLICT),

        // Admin Intervention errors
        SEASON_COMPLETION_REQUIRES_YIELD_AND_DATE("ERR_SEASON_COMPLETION_REQUIRES_YIELD_AND_DATE",
                        "To complete a season, actual yield and end date are required.",
                        HttpStatus.BAD_REQUEST),
        INVALID_TASK_ASSIGNEE("ERR_INVALID_TASK_ASSIGNEE",
                        "The specified user cannot be assigned to this task. User must be the farm owner.",
                        HttpStatus.BAD_REQUEST),

        // Inventory errors
        INSUFFICIENT_STOCK("ERR_INSUFFICIENT_STOCK",
                        "Insufficient stock for the outbound movement",
                        HttpStatus.BAD_REQUEST),
        WAREHOUSE_SEASON_FARM_MISMATCH("ERR_WAREHOUSE_SEASON_FARM_MISMATCH",
                        "Warehouse and season must belong to the same farm",
                        HttpStatus.BAD_REQUEST),
        LOCATION_WAREHOUSE_MISMATCH("ERR_LOCATION_WAREHOUSE_MISMATCH",
                        "Stock location does not belong to the specified warehouse",
                        HttpStatus.BAD_REQUEST),
        WAREHOUSE_NOT_FOUND("ERR_WAREHOUSE_NOT_FOUND", "Warehouse not found", HttpStatus.NOT_FOUND),
        LOCATION_NOT_FOUND("ERR_LOCATION_NOT_FOUND", "Stock location not found", HttpStatus.NOT_FOUND),
        SUPPLY_LOT_NOT_FOUND("ERR_SUPPLY_LOT_NOT_FOUND", "Supply lot not found", HttpStatus.NOT_FOUND),
        INVALID_MOVEMENT_TYPE("ERR_INVALID_MOVEMENT_TYPE", "Invalid stock movement type", HttpStatus.BAD_REQUEST),

        // Supplier errors
        SUPPLIER_NOT_FOUND("ERR_SUPPLIER_NOT_FOUND", "Supplier not found", HttpStatus.NOT_FOUND),
        SUPPLY_ITEM_NOT_FOUND("ERR_SUPPLY_ITEM_NOT_FOUND", "Supply item not found", HttpStatus.NOT_FOUND),
        RESTRICTED_ITEM_REQUIRES_LICENSE("ERR_RESTRICTED_ITEM_REQUIRES_LICENSE",
                        "Restricted items require supplier with valid license", HttpStatus.BAD_REQUEST),
        SUPPLIER_HAS_ACTIVE_LOTS("ERR_SUPPLIER_HAS_ACTIVE_LOTS",
                        "Cannot delete supplier with active supply lots", HttpStatus.CONFLICT),
        SUPPLY_ITEM_HAS_ACTIVE_LOTS("ERR_SUPPLY_ITEM_HAS_ACTIVE_LOTS",
                        "Cannot delete supply item with active supply lots", HttpStatus.CONFLICT),
        SUPPLY_LOT_HAS_MOVEMENTS("ERR_SUPPLY_LOT_HAS_MOVEMENTS",
                        "Cannot delete supply lot with recorded stock movements", HttpStatus.CONFLICT);

        ErrorCode(String code, String message, HttpStatus statusCode) {
                this.code = code;
                this.message = message;
                this.statusCode = statusCode;
        }

        private final String code;
        private final String message;
        private final HttpStatus statusCode;
}
