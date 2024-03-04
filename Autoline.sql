
/* The daily run criteria for the MOT update!!!
1. MOT due in 2 months from today
2. MOT was due 4 moths from today
3. DOLW car worked on yesterday
4. DOLW is 4 months in the past from today (Returning less than 50 vehicles. Main purpose is to check for new blanck records)
5. DOLW is 10 months in the past from today (Same as 4) 
6. Cars created yesterday
7. MOT expired 1 day in the past
8. MOT expired 7 days in the past
9. MOT expired 14 days in the past-
10.MOT expired 21 days in the past-
11.MOT expired 28 days in the past-
- the returned records must not be marked for delete
- all records must have a customer attached
*/

<sql>SELECT DISTINCT SalesCustomerMagic, RegistrationNumber, MOTDueDate, FuelType, BranchBuyStkSel001, AftersalesExecutive, SalesExecutive FROM MK_00_VEHICLERECORDS WHERE MOTDueDate = '{{formatDate(addDays(now; -1); "YYYY-MM-DD")}}' AND DriverCustomerMagi IS NOT NULL AND DriverCustomerMagi != '0' AND CanBeDeleted != 'X' OR MOTDueDate = '{{formatDate(addDays(now; -1); "YYYY-MM-DD")}}' AND ASalesCustomerMag IS NOT NULL AND ASalesCustomerMag != '0' AND CanBeDeleted != 'X' OR MOTDueDate = '{{formatDate(addDays(now; -1); "YYYY-MM-DD")}}' AND SalesCustomerMagic IS NOT NULL AND SalesCustomerMagic != '0' AND CanBeDeleted != 'X' OR MOTDueDate = '{{formatDate(addDays(now; -7); "YYYY-MM-DD")}}' AND DriverCustomerMagi IS NOT NULL AND DriverCustomerMagi != '0' AND CanBeDeleted != 'X' OR MOTDueDate = '{{formatDate(addDays(now; -7); "YYYY-MM-DD")}}' AND ASalesCustomerMag IS NOT NULL AND ASalesCustomerMag != '0' AND CanBeDeleted != 'X' OR MOTDueDate = '{{formatDate(addDays(now; -7); "YYYY-MM-DD")}}' AND SalesCustomerMagic IS NOT NULL AND SalesCustomerMagic != '0' AND CanBeDeleted != 'X' OR MOTDueDate = '{{formatDate(addDays(now; -14); "YYYY-MM-DD")}}' AND DriverCustomerMagi IS NOT NULL AND DriverCustomerMagi != '0' AND CanBeDeleted != 'X' OR MOTDueDate = '{{formatDate(addDays(now; -14); "YYYY-MM-DD")}}' AND ASalesCustomerMag IS NOT NULL AND ASalesCustomerMag != '0' AND CanBeDeleted != 'X' OR MOTDueDate = '{{formatDate(addDays(now; -14); "YYYY-MM-DD")}}' AND SalesCustomerMagic IS NOT NULL AND SalesCustomerMagic != '0' AND CanBeDeleted != 'X' OR MOTDueDate = '{{formatDate(addDays(now; -21); "YYYY-MM-DD")}}' AND DriverCustomerMagi IS NOT NULL AND DriverCustomerMagi != '0' AND CanBeDeleted != 'X' OR MOTDueDate = '{{formatDate(addDays(now; -21); "YYYY-MM-DD")}}' AND ASalesCustomerMag IS NOT NULL AND ASalesCustomerMag != '0' AND CanBeDeleted != 'X' OR MOTDueDate = '{{formatDate(addDays(now; -21); "YYYY-MM-DD")}}' AND SalesCustomerMagic IS NOT NULL AND SalesCustomerMagic != '0' AND CanBeDeleted != 'X' OR MOTDueDate = '{{formatDate(addDays(now; -28); "YYYY-MM-DD")}}' AND DriverCustomerMagi IS NOT NULL AND DriverCustomerMagi != '0' AND CanBeDeleted != 'X' OR MOTDueDate = '{{formatDate(addDays(now; -28); "YYYY-MM-DD")}}' AND ASalesCustomerMag IS NOT NULL AND ASalesCustomerMag != '0' AND CanBeDeleted != 'X' OR MOTDueDate = '{{formatDate(addDays(now; -28); "YYYY-MM-DD")}}' AND SalesCustomerMagic IS NOT NULL AND SalesCustomerMagic != '0' AND CanBeDeleted != 'X' OR MOTDueDate = '{{formatDate(addDays(now; 62); "YYYY-MM-DD")}}' AND DriverCustomerMagi IS NOT NULL AND DriverCustomerMagi != '0' AND CanBeDeleted != 'X' OR MOTDueDate = '{{formatDate(addDays(now; 62); "YYYY-MM-DD")}}' AND ASalesCustomerMag IS NOT NULL AND ASalesCustomerMag != '0' AND CanBeDeleted != 'X' OR MOTDueDate = '{{formatDate(addDays(now; 62); "YYYY-MM-DD")}}' AND SalesCustomerMagic IS NOT NULL AND SalesCustomerMagic != '0' AND CanBeDeleted != 'X' OR MOTDueDate = '{{formatDate(addDays(now; -182); "YYYY-MM-DD")}}' AND DriverCustomerMagi IS NOT NULL AND DriverCustomerMagi != '0' AND CanBeDeleted != 'X' OR MOTDueDate = '{{formatDate(addDays(now; -182); "YYYY-MM-DD")}}' AND ASalesCustomerMag IS NOT NULL AND ASalesCustomerMag != '0' AND CanBeDeleted != 'X' OR MOTDueDate = '{{formatDate(addDays(now; -182); "YYYY-MM-DD")}}' AND SalesCustomerMagic IS NOT NULL AND SalesCustomerMagic != '0' AND CanBeDeleted != 'X' OR DateOfLastWork = '{{formatDate(addDays(now; -1); "YYYY-MM-DD")}}' AND DriverCustomerMagi IS NOT NULL AND DriverCustomerMagi != '0' AND CanBeDeleted != 'X' OR DateOfLastWork = '{{formatDate(addDays(now; -1); "YYYY-MM-DD")}}' AND ASalesCustomerMag IS NOT NULL AND ASalesCustomerMag != '0' AND CanBeDeleted != 'X' OR DateOfLastWork = '{{formatDate(addDays(now; -1); "YYYY-MM-DD")}}' AND SalesCustomerMagic IS NOT NULL AND SalesCustomerMagic != '0' AND CanBeDeleted != 'X' OR DateOfLastWork = '{{formatDate(addDays(now; -182); "YYYY-MM-DD")}}' AND DriverCustomerMagi IS NOT NULL AND DriverCustomerMagi != '0' AND CanBeDeleted != 'X' OR DateOfLastWork = '{{formatDate(addDays(now; -182); "YYYY-MM-DD")}}' AND ASalesCustomerMag IS NOT NULL AND ASalesCustomerMag != '0' AND CanBeDeleted != 'X' OR DateOfLastWork = '{{formatDate(addDays(now; -182); "YYYY-MM-DD")}}' AND SalesCustomerMagic IS NOT NULL AND SalesCustomerMagic != '0' AND CanBeDeleted != 'X' OR DateOfLastWork = '{{formatDate(addDays(now; -300); "YYYY-MM-DD")}}' AND DriverCustomerMagi IS NOT NULL AND DriverCustomerMagi != '0' AND CanBeDeleted != 'X' OR DateOfLastWork = '{{formatDate(addDays(now; -300); "YYYY-MM-DD")}}' AND ASalesCustomerMag IS NOT NULL AND ASalesCustomerMag != '0' AND CanBeDeleted != 'X' OR DateOfLastWork = '{{formatDate(addDays(now; -300); "YYYY-MM-DD")}}' AND SalesCustomerMagic IS NOT NULL AND SalesCustomerMagic != '0' AND CanBeDeleted != 'X' OR DateCreated = '{{formatDate(addDays(now; -1); "YYYY-MM-DD")}}' AND DriverCustomerMagi IS NOT NULL AND DriverCustomerMagi != '0' AND CanBeDeleted != 'X' OR DateCreated = '{{formatDate(addDays(now; -1); "YYYY-MM-DD")}}' AND ASalesCustomerMag IS NOT NULL AND ASalesCustomerMag != '0' AND CanBeDeleted != 'X' OR DateCreated = '{{formatDate(addDays(now; -1); "YYYY-MM-DD")}}' AND SalesCustomerMagic IS NOT NULL AND SalesCustomerMagic != '0' AND CanBeDeleted != 'X'</sql>


<sql>SELECT DISTINCT SalesCustomerMagic, RegistrationNumber, MOTDueDate, FuelType, BranchBuyStkSel001, AftersalesExecutive, SalesExecutive 
FROM MK_00_VEHICLERECORDS 
WHERE MOTDueDate = '{{formatDate(addDays(now; -1); "YYYY-MM-DD")}}' 
AND DriverCustomerMagi IS NOT NULL AND DriverCustomerMagi != '0' 
AND CanBeDeleted != 'X' 
OR MOTDueDate = '{{formatDate(addDays(now; -1); "YYYY-MM-DD")}}' 
AND ASalesCustomerMag IS NOT NULL 
AND ASalesCustomerMag != '0' 
AND CanBeDeleted != 'X' 
OR MOTDueDate = '{{formatDate(addDays(now; -1); "YYYY-MM-DD")}}' 
AND SalesCustomerMagic IS NOT NULL 
AND SalesCustomerMagic != '0' 
AND CanBeDeleted != 'X' 
OR MOTDueDate = '{{formatDate(addDays(now; -7); "YYYY-MM-DD")}}' 
AND DriverCustomerMagi IS NOT NULL 
AND DriverCustomerMagi != '0' 
AND CanBeDeleted != 'X' 
OR MOTDueDate = '{{formatDate(addDays(now; -7); "YYYY-MM-DD")}}' 
AND ASalesCustomerMag IS NOT NULL 
AND ASalesCustomerMag != '0' 
AND CanBeDeleted != 'X' 
OR MOTDueDate = '{{formatDate(addDays(now; -7); "YYYY-MM-DD")}}' 
AND SalesCustomerMagic IS NOT NULL 
AND SalesCustomerMagic != '0' 
AND CanBeDeleted != 'X'
OR MOTDueDate = '{{formatDate(addDays(now; -14); "YYYY-MM-DD")}}' 
AND DriverCustomerMagi IS NOT NULL 
AND DriverCustomerMagi != '0' 
AND CanBeDeleted != 'X' 
OR MOTDueDate = '{{formatDate(addDays(now; -14); "YYYY-MM-DD")}}' 
AND ASalesCustomerMag IS NOT NULL 
AND ASalesCustomerMag != '0' 
AND CanBeDeleted != 'X' 
OR MOTDueDate = '{{formatDate(addDays(now; -14); "YYYY-MM-DD")}}' 
AND SalesCustomerMagic IS NOT NULL 
AND SalesCustomerMagic != '0' 
AND CanBeDeleted != 'X' 
OR MOTDueDate = '{{formatDate(addDays(now; -21); "YYYY-MM-DD")}}' 
AND DriverCustomerMagi IS NOT NULL 
AND DriverCustomerMagi != '0' 
AND CanBeDeleted != 'X' 
OR MOTDueDate = '{{formatDate(addDays(now; -21); "YYYY-MM-DD")}}' 
AND ASalesCustomerMag IS NOT NULL 
AND ASalesCustomerMag != '0' 
AND CanBeDeleted != 'X' 
OR MOTDueDate = '{{formatDate(addDays(now; -21); "YYYY-MM-DD")}}' 
AND SalesCustomerMagic IS NOT NULL 
AND SalesCustomerMagic != '0' 
AND CanBeDeleted != 'X' 
OR MOTDueDate = '{{formatDate(addDays(now; -28); "YYYY-MM-DD")}}' 
AND DriverCustomerMagi IS NOT NULL 
AND DriverCustomerMagi != '0' 
AND CanBeDeleted != 'X' 
OR MOTDueDate = '{{formatDate(addDays(now; -28); "YYYY-MM-DD")}}' 
AND ASalesCustomerMag IS NOT NULL 
AND ASalesCustomerMag != '0' 
AND CanBeDeleted != 'X' 
OR MOTDueDate = '{{formatDate(addDays(now; -28); "YYYY-MM-DD")}}' 
AND SalesCustomerMagic IS NOT NULL 
AND SalesCustomerMagic != '0' 
AND CanBeDeleted != 'X' 
OR MOTDueDate = '{{formatDate(addDays(now; 62); "YYYY-MM-DD")}}' 
AND DriverCustomerMagi IS NOT NULL 
AND DriverCustomerMagi != '0' 
AND CanBeDeleted != 'X' 
OR MOTDueDate = '{{formatDate(addDays(now; 62); "YYYY-MM-DD")}}' 
AND ASalesCustomerMag IS NOT NULL 
AND ASalesCustomerMag != '0' 
AND CanBeDeleted != 'X' 
OR MOTDueDate = '{{formatDate(addDays(now; 62); "YYYY-MM-DD")}}' 
AND SalesCustomerMagic IS NOT NULL 
AND SalesCustomerMagic != '0' 
AND CanBeDeleted != 'X' 
OR MOTDueDate = '{{formatDate(addDays(now; -182); "YYYY-MM-DD")}}' 
AND DriverCustomerMagi IS NOT NULL 
AND DriverCustomerMagi != '0' 
AND CanBeDeleted != 'X' 
OR MOTDueDate = '{{formatDate(addDays(now; -182); "YYYY-MM-DD")}}' 
AND ASalesCustomerMag IS NOT NULL 
AND ASalesCustomerMag != '0' 
AND CanBeDeleted != 'X' 
OR MOTDueDate = '{{formatDate(addDays(now; -182); "YYYY-MM-DD")}}' 
AND SalesCustomerMagic IS NOT NULL 
AND SalesCustomerMagic != '0' 
AND CanBeDeleted != 'X' 
OR DateOfLastWork = '{{formatDate(addDays(now; -1); "YYYY-MM-DD")}}' 
AND DriverCustomerMagi IS NOT NULL 
AND DriverCustomerMagi != '0' 
AND CanBeDeleted != 'X' 
OR DateOfLastWork = '{{formatDate(addDays(now; -1); "YYYY-MM-DD")}}' 
AND ASalesCustomerMag IS NOT NULL 
AND ASalesCustomerMag != '0' 
AND CanBeDeleted != 'X' 
OR DateOfLastWork = '{{formatDate(addDays(now; -1); "YYYY-MM-DD")}}' 
AND SalesCustomerMagic IS NOT NULL 
AND SalesCustomerMagic != '0' 
AND CanBeDeleted != 'X' 
OR DateOfLastWork = '{{formatDate(addDays(now; -182); "YYYY-MM-DD")}}' 
AND DriverCustomerMagi IS NOT NULL 
AND DriverCustomerMagi != '0' 
AND CanBeDeleted != 'X' 
OR DateOfLastWork = '{{formatDate(addDays(now; -182); "YYYY-MM-DD")}}' 
AND ASalesCustomerMag IS NOT NULL 
AND ASalesCustomerMag != '0' 
AND CanBeDeleted != 'X' 
OR DateOfLastWork = '{{formatDate(addDays(now; -182); "YYYY-MM-DD")}}' 
AND SalesCustomerMagic IS NOT NULL 
AND SalesCustomerMagic != '0' 
AND CanBeDeleted != 'X' 
OR DateOfLastWork = '{{formatDate(addDays(now; -300); "YYYY-MM-DD")}}' 
AND DriverCustomerMagi IS NOT NULL 
AND DriverCustomerMagi != '0' 
AND CanBeDeleted != 'X' 
OR DateOfLastWork = '{{formatDate(addDays(now; -300); "YYYY-MM-DD")}}' 
AND ASalesCustomerMag IS NOT NULL 
AND ASalesCustomerMag != '0' 
AND CanBeDeleted != 'X' 
OR DateOfLastWork = '{{formatDate(addDays(now; -300); "YYYY-MM-DD")}}' 
AND SalesCustomerMagic IS NOT NULL 
AND SalesCustomerMagic != '0' 
AND CanBeDeleted != 'X' 
OR DateCreated = '{{formatDate(addDays(now; -1); "YYYY-MM-DD")}}' 
AND DriverCustomerMagi IS NOT NULL 
AND DriverCustomerMagi != '0' 
AND CanBeDeleted != 'X' 
OR DateCreated = '{{formatDate(addDays(now; -1); "YYYY-MM-DD")}}' 
AND ASalesCustomerMag IS NOT NULL 
AND ASalesCustomerMag != '0' 
AND CanBeDeleted != 'X' 
OR DateCreated = '{{formatDate(addDays(now; -1); "YYYY-MM-DD")}}' 
AND SalesCustomerMagic IS NOT NULL 
AND SalesCustomerMagic != '0' 
AND CanBeDeleted != 'X'</sql>

/* get Sales and Aftersales, process relays on the MK_00_VEHICLEDEFAULTRECORDS records to be up to date*/
<sql>SELECT AftersalesExecutive, SalesExecutive FROM MK_00_VEHICLEDEFAULTRECORDS WHERE BranchBuyStkSel001 = (SELECT BranchLocation FROM MK_00_SERVICEHISTORY WHERE CustomerMagicNumbe = {{55.SalesCustomerMagic[]}} AND SequentialServceNo = (SELECT MAX(SequentialServceNo) FROM MK_00_SERVICEHISTORY WHERE CustomerMagicNumbe = {{55.SalesCustomerMagic[]}}));</sql>

/*Get Sales and Aftersales executive*/
<sql>SELECT sales.Executive AS Sales, aftersales.Executive AS Aftersales FROM MK_00_CUSTOMERCOSTCENTREDEFAULTS sales, MK_00_CUSTOMERCOSTCENTREDEFAULTS aftersales WHERE sales.Branch = 'CM3' AND aftersales.Branch = 'CM3' AND sales.Department = 'S' AND aftersales.Department = 'W'</sql>


/**********************************************************************************************************************************************************************************************************************************************************************************************************8*/


/*VEHICLE CLEANS CODE*/

/*Get M status stock numbers where:
-Status is M
-Progress code is M
-Chassis char lenght is not equal to 17
-Internal order date older than 180 days
-Order date is older than 180 days
-Cd security code is not equal to REPORT-OM4*/

/*new stock table new code*/

<sql>SELECT Top {{(600 - 125.result)}} StockbookNumber FROM VS_{{121.field_2443_raw}}_NEWVEHICLESTOCK WHERE ACSStatus = 'M' AND ProgressCode = 'M' AND LENGTH(FULLChassis) &lt;> 17 AND ModelCode &lt;> '' AND VariantCode &lt;> '' AND InternalOrderDate &lt; '{{formatDate(addDays(now; -180); "YYYY-MM-DD")}}' AND CDSecurityCode &lt;> 'REPORT-OM4' AND OrderDate &lt; '{{formatDate(addDays(now; -180); "YYYY-MM-DD")}}' AND DateReserved &lt; '{{formatDate(addDays(now; -720); "YYYY-MM-DD")}}' OR ACSStatus = 'M' AND ProgressCode = 'M' AND LENGTH(FULLChassis) &lt;> 17 AND ModelCode &lt;> '' AND VariantCode &lt;> '' AND InternalOrderDate IS NULL AND CDSecurityCode &lt;> 'REPORT-OM4' AND OrderDate &lt; '{{formatDate(addDays(now; -180); "YYYY-MM-DD")}}' AND DateReserved &lt; '{{formatDate(addDays(now; -720); "YYYY-MM-DD")}}' OR ACSStatus = 'M' AND ProgressCode = 'M' AND LENGTH(FULLChassis) &lt;> 17 AND ModelCode &lt;> '' AND VariantCode &lt;> '' AND InternalOrderDate &lt; '{{formatDate(addDays(now; -180); "YYYY-MM-DD")}}' AND CDSecurityCode &lt;> 'REPORT-OM4' AND OrderDate IS NULL AND DateReserved &lt; '{{formatDate(addDays(now; -720); "YYYY-MM-DD")}}' OR ACSStatus = 'M' AND ProgressCode = 'M' AND LENGTH(FULLChassis) &lt;> 17 AND ModelCode IS NOT NULL AND ModelCode &lt;> '' AND VariantCode &lt;> '' AND CDSecurityCode &lt;> 'REPORT-OM4' AND OrderDate IS NULL AND DateReserved &lt; '{{formatDate(addDays(now; -720); "YYYY-MM-DD")}}' OR ACSStatus = 'M' AND ProgressCode = 'M' AND FULLChassis IS NULL AND ModelCode &lt;> '' AND VariantCode &lt;> '' AND InternalOrderDate &lt; '{{formatDate(addDays(now; -180); "YYYY-MM-DD")}}' AND CDSecurityCode &lt;> 'REPORT-OM4' AND OrderDate &lt; '{{formatDate(addDays(now; -180); "YYYY-MM-DD")}}' AND DateReserved &lt; '{{formatDate(addDays(now; -720); "YYYY-MM-DD")}}' OR ACSStatus = 'M' AND ProgressCode = 'M' AND FULLChassis IS NULL AND InternalOrderDate IS NULL AND ModelCode &lt;> '' AND VariantCode &lt;> '' AND CDSecurityCode &lt;> 'REPORT-OM4' AND OrderDate &lt; '{{formatDate(addDays(now; -180); "YYYY-MM-DD")}}' AND DateReserved &lt; '{{formatDate(addDays(now; -720); "YYYY-MM-DD")}}' OR ACSStatus = 'M' AND ProgressCode = 'M' AND FULLChassis IS NULL AND ModelCode &lt;> '' AND VariantCode &lt;> '' AND InternalOrderDate &lt; '{{formatDate(addDays(now; -180); "YYYY-MM-DD")}}' AND CDSecurityCode &lt;> 'REPORT-OM4' AND OrderDate IS NULL AND DateReserved &lt; '{{formatDate(addDays(now; -720); "YYYY-MM-DD")}}' OR ACSStatus = 'M' AND ProgressCode = 'M' AND FULLChassis IS NULL AND ModelCode &lt;> '' AND VariantCode &lt;> '' AND InternalOrderDate IS NULL AND CDSecurityCode &lt;> 'REPORT-OM4' AND OrderDate IS NULL AND DateReserved &lt; '{{formatDate(addDays(now; -720); "YYYY-MM-DD")}}' OR ACSStatus = 'M' AND ProgressCode = 'M' AND LENGTH(FULLChassis) &lt;> 17 AND ModelCode &lt;> '' AND VariantCode &lt;> '' AND InternalOrderDate &lt; '{{formatDate(addDays(now; -180); "YYYY-MM-DD")}}' AND CDSecurityCode &lt;> 'REPORT-OM4' AND OrderDate &lt; '{{formatDate(addDays(now; -180); "YYYY-MM-DD")}}' AND DateReserved IS NULL OR ACSStatus = 'M' AND ProgressCode = 'M' AND LENGTH(FULLChassis) &lt;> 17 AND ModelCode &lt;> '' AND VariantCode &lt;> '' AND InternalOrderDate IS NULL AND CDSecurityCode &lt;> 'REPORT-OM4' AND OrderDate &lt; '{{formatDate(addDays(now; -180); "YYYY-MM-DD")}}' AND DateReserved IS NULL OR ACSStatus = 'M' AND ProgressCode = 'M' AND LENGTH(FULLChassis) &lt;> 17 AND ModelCode &lt;> '' AND VariantCode &lt;> '' AND InternalOrderDate &lt; '{{formatDate(addDays(now; -180); "YYYY-MM-DD")}}' AND CDSecurityCode &lt;> 'REPORT-OM4' AND OrderDate IS NULL AND DateReserved IS NULL OR ACSStatus = 'M' AND ProgressCode = 'M' AND LENGTH(FULLChassis) &lt;> 17 AND ModelCode IS NOT NULL AND ModelCode &lt;> '' AND VariantCode &lt;> '' AND CDSecurityCode &lt;> 'REPORT-OM4' AND OrderDate IS NULL AND DateReserved IS NULL OR ACSStatus = 'M' AND ProgressCode = 'M' AND FULLChassis IS NULL AND ModelCode &lt;> '' AND VariantCode &lt;> '' AND InternalOrderDate &lt; '{{formatDate(addDays(now; -180); "YYYY-MM-DD")}}' AND CDSecurityCode &lt;> 'REPORT-OM4' AND OrderDate &lt; '{{formatDate(addDays(now; -180); "YYYY-MM-DD")}}' AND DateReserved IS NULL OR ACSStatus = 'M' AND ProgressCode = 'M' AND FULLChassis IS NULL AND InternalOrderDate IS NULL AND ModelCode &lt;> '' AND VariantCode &lt;> '' AND CDSecurityCode &lt;> 'REPORT-OM4' AND OrderDate &lt; '{{formatDate(addDays(now; -180); "YYYY-MM-DD")}}' AND DateReserved IS NULL OR ACSStatus = 'M' AND ProgressCode = 'M' AND FULLChassis IS NULL AND ModelCode &lt;> '' AND VariantCode &lt;> '' AND InternalOrderDate &lt; '{{formatDate(addDays(now; -180); "YYYY-MM-DD")}}' AND CDSecurityCode &lt;> 'REPORT-OM4' AND OrderDate IS NULL AND DateReserved IS NULL OR ACSStatus = 'M' AND ProgressCode = 'M' AND FULLChassis IS NULL AND ModelCode &lt;> '' AND VariantCode &lt;> '' AND InternalOrderDate IS NULL AND CDSecurityCode &lt;> 'REPORT-OM4' AND OrderDate IS NULL AND DateReserved IS NULL </sql>

<sql>SELECT Top 500 StockbookNumber FROM VS_LW_NEWVEHICLESTOCK WHERE ACSStatus = 'M' AND ProgressCode = 'M' AND LENGTH(FULLChassis) &lt;> 17 AND ModelCode &lt;> '' AND VariantCode &lt;> '' AND InternalOrderDate &lt; '{{formatDate(addDays(now; -180); "YYYY-MM-DD")}}' AND CDSecurityCode &lt;> 'REPORT-OM4' AND OrderDate &lt; '{{formatDate(addDays(now; -180); "YYYY-MM-DD")}}' AND DateReserved &lt; '{{formatDate(addDays(now; -720); "YYYY-MM-DD")}}' OR ACSStatus = 'M' AND ProgressCode = 'M' AND LENGTH(FULLChassis) &lt;> 17 AND ModelCode &lt;> '' AND VariantCode &lt;> '' AND InternalOrderDate IS NULL AND CDSecurityCode &lt;> 'REPORT-OM4' AND OrderDate &lt; '{{formatDate(addDays(now; -180); "YYYY-MM-DD")}}' AND DateReserved &lt; '{{formatDate(addDays(now; -720); "YYYY-MM-DD")}}' OR ACSStatus = 'M' AND ProgressCode = 'M' AND LENGTH(FULLChassis) &lt;> 17 AND ModelCode &lt;> '' AND VariantCode &lt;> '' AND InternalOrderDate &lt; '{{formatDate(addDays(now; -180); "YYYY-MM-DD")}}' AND CDSecurityCode &lt;> 'REPORT-OM4' AND OrderDate IS NULL AND DateReserved &lt; '{{formatDate(addDays(now; -720); "YYYY-MM-DD")}}' OR ACSStatus = 'M' AND ProgressCode = 'M' AND LENGTH(FULLChassis) &lt;> 17 AND ModelCode IS NOT NULL AND ModelCode &lt;> '' AND VariantCode &lt;> '' AND CDSecurityCode &lt;> 'REPORT-OM4' AND OrderDate IS NULL AND DateReserved &lt; '{{formatDate(addDays(now; -720); "YYYY-MM-DD")}}' OR ACSStatus = 'M' AND ProgressCode = 'M' AND FULLChassis IS NULL AND ModelCode &lt;> '' AND VariantCode &lt;> '' AND InternalOrderDate &lt; '{{formatDate(addDays(now; -180); "YYYY-MM-DD")}}' AND CDSecurityCode &lt;> 'REPORT-OM4' AND OrderDate &lt; '{{formatDate(addDays(now; -180); "YYYY-MM-DD")}}' AND DateReserved &lt; '{{formatDate(addDays(now; -720); "YYYY-MM-DD")}}' OR ACSStatus = 'M' AND ProgressCode = 'M' AND FULLChassis IS NULL AND InternalOrderDate IS NULL AND ModelCode &lt;> '' AND VariantCode &lt;> '' AND CDSecurityCode &lt;> 'REPORT-OM4' AND OrderDate &lt; '{{formatDate(addDays(now; -180); "YYYY-MM-DD")}}' AND DateReserved &lt; '{{formatDate(addDays(now; -720); "YYYY-MM-DD")}}' OR ACSStatus = 'M' AND ProgressCode = 'M' AND FULLChassis IS NULL AND ModelCode &lt;> '' AND VariantCode &lt;> '' AND InternalOrderDate &lt; '{{formatDate(addDays(now; -180); "YYYY-MM-DD")}}' AND CDSecurityCode &lt;> 'REPORT-OM4' AND OrderDate IS NULL AND DateReserved &lt; '{{formatDate(addDays(now; -720); "YYYY-MM-DD")}}' OR ACSStatus = 'M' AND ProgressCode = 'M' AND FULLChassis IS NULL AND ModelCode &lt;> '' AND VariantCode &lt;> '' AND InternalOrderDate IS NULL AND CDSecurityCode &lt;> 'REPORT-OM4' AND OrderDate IS NULL AND DateReserved &lt; '{{formatDate(addDays(now; -720); "YYYY-MM-DD")}}' OR ACSStatus = 'M' AND ProgressCode = 'M' AND LENGTH(FULLChassis) &lt;> 17 AND ModelCode &lt;> '' AND VariantCode &lt;> '' AND InternalOrderDate &lt; '{{formatDate(addDays(now; -180); "YYYY-MM-DD")}}' AND CDSecurityCode &lt;> 'REPORT-OM4' AND OrderDate &lt; '{{formatDate(addDays(now; -180); "YYYY-MM-DD")}}' AND DateReserved IS NULL OR ACSStatus = 'M' AND ProgressCode = 'M' AND LENGTH(FULLChassis) &lt;> 17 AND ModelCode &lt;> '' AND VariantCode &lt;> '' AND InternalOrderDate IS NULL AND CDSecurityCode &lt;> 'REPORT-OM4' AND OrderDate &lt; '{{formatDate(addDays(now; -180); "YYYY-MM-DD")}}' AND DateReserved IS NULL OR ACSStatus = 'M' AND ProgressCode = 'M' AND LENGTH(FULLChassis) &lt;> 17 AND ModelCode &lt;> '' AND VariantCode &lt;> '' AND InternalOrderDate &lt; '{{formatDate(addDays(now; -180); "YYYY-MM-DD")}}' AND CDSecurityCode &lt;> 'REPORT-OM4' AND OrderDate IS NULL AND DateReserved IS NULL OR ACSStatus = 'M' AND ProgressCode = 'M' AND LENGTH(FULLChassis) &lt;> 17 AND ModelCode IS NOT NULL AND ModelCode &lt;> '' AND VariantCode &lt;> '' AND CDSecurityCode &lt;> 'REPORT-OM4' AND OrderDate IS NULL AND DateReserved IS NULL OR ACSStatus = 'M' AND ProgressCode = 'M' AND FULLChassis IS NULL AND ModelCode &lt;> '' AND VariantCode &lt;> '' AND InternalOrderDate &lt; '{{formatDate(addDays(now; -180); "YYYY-MM-DD")}}' AND CDSecurityCode &lt;> 'REPORT-OM4' AND OrderDate &lt; '{{formatDate(addDays(now; -180); "YYYY-MM-DD")}}' AND DateReserved IS NULL OR ACSStatus = 'M' AND ProgressCode = 'M' AND FULLChassis IS NULL AND InternalOrderDate IS NULL AND ModelCode &lt;> '' AND VariantCode &lt;> '' AND CDSecurityCode &lt;> 'REPORT-OM4' AND OrderDate &lt; '{{formatDate(addDays(now; -180); "YYYY-MM-DD")}}' AND DateReserved IS NULL OR ACSStatus = 'M' AND ProgressCode = 'M' AND FULLChassis IS NULL AND ModelCode &lt;> '' AND VariantCode &lt;> '' AND InternalOrderDate &lt; '{{formatDate(addDays(now; -180); "YYYY-MM-DD")}}' AND CDSecurityCode &lt;> 'REPORT-OM4' AND OrderDate IS NULL AND DateReserved IS NULL OR ACSStatus = 'M' AND ProgressCode = 'M' AND FULLChassis IS NULL AND ModelCode &lt;> '' AND VariantCode &lt;> '' AND InternalOrderDate IS NULL AND CDSecurityCode &lt;> 'REPORT-OM4' AND OrderDate IS NULL AND DateReserved IS NULL </sql>


<sql>SELECT COUNT(StockbookNumber) FROM VS_LW_NEWVEHICLESTOCK WHERE ACSStatus = 'M' AND ProgressCode = 'M' AND LENGTH(FULLChassis) &lt;> 17 AND ModelCode &lt;> '' AND VariantCode &lt;> '' AND InternalOrderDate &lt; '{{formatDate(addDays(now; -180); "YYYY-MM-DD")}}' AND CDSecurityCode &lt;> 'REPORT-OM4' AND OrderDate &lt; '{{formatDate(addDays(now; -180); "YYYY-MM-DD")}}' AND DateReserved &lt; '{{formatDate(addDays(now; -720); "YYYY-MM-DD")}}' OR ACSStatus = 'M' AND ProgressCode = 'M' AND LENGTH(FULLChassis) &lt;> 17 AND ModelCode &lt;> '' AND VariantCode &lt;> '' AND InternalOrderDate IS NULL AND CDSecurityCode &lt;> 'REPORT-OM4' AND OrderDate &lt; '{{formatDate(addDays(now; -180); "YYYY-MM-DD")}}' AND DateReserved &lt; '{{formatDate(addDays(now; -720); "YYYY-MM-DD")}}' OR ACSStatus = 'M' AND ProgressCode = 'M' AND LENGTH(FULLChassis) &lt;> 17 AND ModelCode &lt;> '' AND VariantCode &lt;> '' AND InternalOrderDate &lt; '{{formatDate(addDays(now; -180); "YYYY-MM-DD")}}' AND CDSecurityCode &lt;> 'REPORT-OM4' AND OrderDate IS NULL AND DateReserved &lt; '{{formatDate(addDays(now; -720); "YYYY-MM-DD")}}' OR ACSStatus = 'M' AND ProgressCode = 'M' AND LENGTH(FULLChassis) &lt;> 17 AND ModelCode IS NOT NULL AND ModelCode &lt;> '' AND VariantCode &lt;> '' AND CDSecurityCode &lt;> 'REPORT-OM4' AND OrderDate IS NULL AND DateReserved &lt; '{{formatDate(addDays(now; -720); "YYYY-MM-DD")}}' OR ACSStatus = 'M' AND ProgressCode = 'M' AND FULLChassis IS NULL AND ModelCode &lt;> '' AND VariantCode &lt;> '' AND InternalOrderDate &lt; '{{formatDate(addDays(now; -180); "YYYY-MM-DD")}}' AND CDSecurityCode &lt;> 'REPORT-OM4' AND OrderDate &lt; '{{formatDate(addDays(now; -180); "YYYY-MM-DD")}}' AND DateReserved &lt; '{{formatDate(addDays(now; -720); "YYYY-MM-DD")}}' OR ACSStatus = 'M' AND ProgressCode = 'M' AND FULLChassis IS NULL AND InternalOrderDate IS NULL AND ModelCode &lt;> '' AND VariantCode &lt;> '' AND CDSecurityCode &lt;> 'REPORT-OM4' AND OrderDate &lt; '{{formatDate(addDays(now; -180); "YYYY-MM-DD")}}' AND DateReserved &lt; '{{formatDate(addDays(now; -720); "YYYY-MM-DD")}}' OR ACSStatus = 'M' AND ProgressCode = 'M' AND FULLChassis IS NULL AND ModelCode &lt;> '' AND VariantCode &lt;> '' AND InternalOrderDate &lt; '{{formatDate(addDays(now; -180); "YYYY-MM-DD")}}' AND CDSecurityCode &lt;> 'REPORT-OM4' AND OrderDate IS NULL AND DateReserved &lt; '{{formatDate(addDays(now; -720); "YYYY-MM-DD")}}' OR ACSStatus = 'M' AND ProgressCode = 'M' AND FULLChassis IS NULL AND ModelCode &lt;> '' AND VariantCode &lt;> '' AND InternalOrderDate IS NULL AND CDSecurityCode &lt;> 'REPORT-OM4' AND OrderDate IS NULL AND DateReserved &lt; '{{formatDate(addDays(now; -720); "YYYY-MM-DD")}}' OR ACSStatus = 'M' AND ProgressCode = 'M' AND LENGTH(FULLChassis) &lt;> 17 AND ModelCode &lt;> '' AND VariantCode &lt;> '' AND InternalOrderDate &lt; '{{formatDate(addDays(now; -180); "YYYY-MM-DD")}}' AND CDSecurityCode &lt;> 'REPORT-OM4' AND OrderDate &lt; '{{formatDate(addDays(now; -180); "YYYY-MM-DD")}}' AND DateReserved IS NULL OR ACSStatus = 'M' AND ProgressCode = 'M' AND LENGTH(FULLChassis) &lt;> 17 AND ModelCode &lt;> '' AND VariantCode &lt;> '' AND InternalOrderDate IS NULL AND CDSecurityCode &lt;> 'REPORT-OM4' AND OrderDate &lt; '{{formatDate(addDays(now; -180); "YYYY-MM-DD")}}' AND DateReserved IS NULL OR ACSStatus = 'M' AND ProgressCode = 'M' AND LENGTH(FULLChassis) &lt;> 17 AND ModelCode &lt;> '' AND VariantCode &lt;> '' AND InternalOrderDate &lt; '{{formatDate(addDays(now; -180); "YYYY-MM-DD")}}' AND CDSecurityCode &lt;> 'REPORT-OM4' AND OrderDate IS NULL AND DateReserved IS NULL OR ACSStatus = 'M' AND ProgressCode = 'M' AND LENGTH(FULLChassis) &lt;> 17 AND ModelCode IS NOT NULL AND ModelCode &lt;> '' AND VariantCode &lt;> '' AND CDSecurityCode &lt;> 'REPORT-OM4' AND OrderDate IS NULL AND DateReserved IS NULL OR ACSStatus = 'M' AND ProgressCode = 'M' AND FULLChassis IS NULL AND ModelCode &lt;> '' AND VariantCode &lt;> '' AND InternalOrderDate &lt; '{{formatDate(addDays(now; -180); "YYYY-MM-DD")}}' AND CDSecurityCode &lt;> 'REPORT-OM4' AND OrderDate &lt; '{{formatDate(addDays(now; -180); "YYYY-MM-DD")}}' AND DateReserved IS NULL OR ACSStatus = 'M' AND ProgressCode = 'M' AND FULLChassis IS NULL AND InternalOrderDate IS NULL AND ModelCode &lt;> '' AND VariantCode &lt;> '' AND CDSecurityCode &lt;> 'REPORT-OM4' AND OrderDate &lt; '{{formatDate(addDays(now; -180); "YYYY-MM-DD")}}' AND DateReserved IS NULL OR ACSStatus = 'M' AND ProgressCode = 'M' AND FULLChassis IS NULL AND ModelCode &lt;> '' AND VariantCode &lt;> '' AND InternalOrderDate &lt; '{{formatDate(addDays(now; -180); "YYYY-MM-DD")}}' AND CDSecurityCode &lt;> 'REPORT-OM4' AND OrderDate IS NULL AND DateReserved IS NULL OR ACSStatus = 'M' AND ProgressCode = 'M' AND FULLChassis IS NULL AND ModelCode &lt;> '' AND VariantCode &lt;> '' AND InternalOrderDate IS NULL AND CDSecurityCode &lt;> 'REPORT-OM4' AND OrderDate IS NULL AND DateReserved IS NULL </sql>

/*new stock table old code*/
<sql>SELECT Top 500 StockbookNumber FROM VS_BH_NEWVEHICLESTOCK WHERE ACSStatus = 'M' AND ProgressCode = 'M' AND LENGTH(FULLChassis) &lt;> 17 AND ModelCode &lt;> '' AND VariantCode &lt;> '' AND InternalOrderDate &lt; '{{formatDate(addDays(now; -180); "YYYY-MM-DD")}}' AND CDSecurityCode &lt;> 'REPORT-OM4' AND OrderDate &lt; '{{formatDate(addDays(now; -180); "YYYY-MM-DD")}}' OR ACSStatus = 'M' AND ProgressCode = 'M' AND LENGTH(FULLChassis) &lt;> 17 AND ModelCode &lt;> '' AND VariantCode &lt;> '' AND InternalOrderDate IS NULL AND CDSecurityCode &lt;> 'REPORT-OM4' AND OrderDate &lt; '{{formatDate(addDays(now; -180); "YYYY-MM-DD")}}' OR ACSStatus = 'M' AND ProgressCode = 'M' AND LENGTH(FULLChassis) &lt;> 17 AND ModelCode &lt;> '' AND VariantCode &lt;> '' AND InternalOrderDate &lt; '{{formatDate(addDays(now; -180); "YYYY-MM-DD")}}' AND CDSecurityCode &lt;> 'REPORT-OM4' AND OrderDate IS NULL OR ACSStatus = 'M' AND ProgressCode = 'M' AND LENGTH(FULLChassis) &lt;> 17 AND ModelCode IS NOT NULL AND ModelCode &lt;> '' AND VariantCode &lt;> '' AND CDSecurityCode &lt;> 'REPORT-OM4' AND OrderDate IS NULL OR ACSStatus = 'M' AND ProgressCode = 'M' AND FULLChassis IS NULL AND ModelCode &lt;> '' AND VariantCode &lt;> '' AND InternalOrderDate &lt; '{{formatDate(addDays(now; -180); "YYYY-MM-DD")}}' AND CDSecurityCode &lt;> 'REPORT-OM4' AND OrderDate &lt; '{{formatDate(addDays(now; -180); "YYYY-MM-DD")}}' OR ACSStatus = 'M' AND ProgressCode = 'M' AND FULLChassis IS NULL AND InternalOrderDate IS NULL AND ModelCode &lt;> '' AND VariantCode &lt;> '' AND CDSecurityCode &lt;> 'REPORT-OM4' AND OrderDate &lt; '{{formatDate(addDays(now; -180); "YYYY-MM-DD")}}' OR ACSStatus = 'M' AND ProgressCode = 'M' AND FULLChassis IS NULL AND ModelCode &lt;> '' AND VariantCode &lt;> '' AND InternalOrderDate &lt; '{{formatDate(addDays(now; -180); "YYYY-MM-DD")}}' AND CDSecurityCode &lt;> 'REPORT-OM4' AND OrderDate IS NULL OR ACSStatus = 'M' AND ProgressCode = 'M' AND FULLChassis IS NULL AND ModelCode &lt;> '' AND VariantCode &lt;> '' AND InternalOrderDate IS NULL AND CDSecurityCode &lt;> 'REPORT-OM4' AND OrderDate IS NULL</sql>

<sql>SELECT COUNT(StockbookNumber) FROM VS_RM_NEWVEHICLESTOCK WHERE ACSStatus = 'M' AND ProgressCode = 'M' AND LENGTH(FULLChassis) &lt;> 17 AND ModelCode &lt;> '' AND VariantCode &lt;> '' AND InternalOrderDate &lt; '{{formatDate(addDays(now; -180); "YYYY-MM-DD")}}' AND CDSecurityCode &lt;> 'REPORT-OM4' AND OrderDate &lt; '{{formatDate(addDays(now; -180); "YYYY-MM-DD")}}' OR ACSStatus = 'M' AND ProgressCode = 'M' AND LENGTH(FULLChassis) &lt;> 17 AND ModelCode &lt;> '' AND VariantCode &lt;> '' AND InternalOrderDate IS NULL AND CDSecurityCode &lt;> 'REPORT-OM4' AND OrderDate &lt; '{{formatDate(addDays(now; -180); "YYYY-MM-DD")}}' OR ACSStatus = 'M' AND ProgressCode = 'M' AND LENGTH(FULLChassis) &lt;> 17 AND ModelCode &lt;> '' AND VariantCode &lt;> '' AND InternalOrderDate &lt; '{{formatDate(addDays(now; -180); "YYYY-MM-DD")}}' AND CDSecurityCode &lt;> 'REPORT-OM4' AND OrderDate IS NULL OR ACSStatus = 'M' AND ProgressCode = 'M' AND LENGTH(FULLChassis) &lt;> 17 AND ModelCode IS NOT NULL AND ModelCode &lt;> '' AND VariantCode &lt;> '' AND CDSecurityCode &lt;> 'REPORT-OM4' AND OrderDate IS NULL OR ACSStatus = 'M' AND ProgressCode = 'M' AND FULLChassis IS NULL AND ModelCode &lt;> '' AND VariantCode &lt;> '' AND InternalOrderDate &lt; '{{formatDate(addDays(now; -180); "YYYY-MM-DD")}}' AND CDSecurityCode &lt;> 'REPORT-OM4' AND OrderDate &lt; '{{formatDate(addDays(now; -180); "YYYY-MM-DD")}}' OR ACSStatus = 'M' AND ProgressCode = 'M' AND FULLChassis IS NULL AND InternalOrderDate IS NULL AND ModelCode &lt;> '' AND VariantCode &lt;> '' AND CDSecurityCode &lt;> 'REPORT-OM4' AND OrderDate &lt; '{{formatDate(addDays(now; -180); "YYYY-MM-DD")}}' OR ACSStatus = 'M' AND ProgressCode = 'M' AND FULLChassis IS NULL AND ModelCode &lt;> '' AND VariantCode &lt;> '' AND InternalOrderDate &lt; '{{formatDate(addDays(now; -180); "YYYY-MM-DD")}}' AND CDSecurityCode &lt;> 'REPORT-OM4' AND OrderDate IS NULL OR ACSStatus = 'M' AND ProgressCode = 'M' AND FULLChassis IS NULL AND ModelCode &lt;> '' AND VariantCode &lt;> '' AND InternalOrderDate IS NULL AND CDSecurityCode &lt;> 'REPORT-OM4' AND OrderDate IS NULL</sql>

/*v speck table*/

<sql>SELECT Top 1 VehicleQuoteNumber, ActualCost, VehicleTypeNU, SourceOfData FROM VS_BW_VEHICLESPECIFICATION WHERE VehicleTypeNU = 'N' AND VehicleQuoteNumber = {{55.StockbookNumber[]}} AND SourceOfData &lt;> 'P' AND ActualCost &lt;> '0'</sql>

<sql>SELECT Top 1 VehicleQuoteNumber, ActualCost, VehicleTypeNU, SourceOfData FROM VS_BW_VEHICLESPECIFICATION WHERE VehicleTypeNU = 'N' AND VehicleQuoteNumber = {{55.StockbookNumber[]}} AND SourceOfData = 'P' AND ActualCost &lt;> '0' OR VehicleTypeNU = 'N' AND VehicleQuoteNumber = {{55.StockbookNumber[]}} AND SourceOfData &lt;> 'P' AND SourceOfData &lt;> 'F'</sql>

/*in use now*/
<sql>SELECT Top 1 VehicleQuoteNumber, ActualCost, VehicleTypeNU, SourceOfData FROM VS_BW_VEHICLESPECIFICATION WHERE VehicleTypeNU = 'N' AND VehicleQuoteNumber = {{55.StockbookNumber[]}} AND SourceOfData = 'P' AND ActualCost &lt;> '0'</sql>



/**********************************************************************************************************************************************************************************************************************************************************************************************************8*/

/*Duplicate vehicle code*/

<sql>SELECT RegistrationNumber, ChassisNumber, VehicleNumber, ModelCode, ModelVariant, BriefDescription, PreviousRegNumber, RecordStatus, VSBReference, SalesCustomerMagic, ASalesCustomerMag, DriverCustomerMagi FROM MK_00_VEHICLERECORDS WHERE RegistrationNumber = 'GK17YHC' ORDER BY VehicleNumber ASC</sql>



/*Duplicate vehicle select transfer chart*/
/* The complete transfer logic statement for integromat*/
{{if(2.field_7614_raw != "No" & 2.field_7615_raw = "No"; 2.field_7617_raw + "TransferTo" + 2.field_7616_raw; if(2.field_7614_raw = "No" & 2.field_7615_raw != "No"; 2.field_7616_raw + "TransferTo" + 2.field_7617_raw; if(((16.`soap:Envelope`.`soap:Body`[1].ExecuteSqlResponse[1].ExecuteSqlResult[1].`diffgr:diffgram`[1].`diffgr:before`[1].ResultTable[1].EXPR_1[1] = "V1History" | 16.`soap:Envelope`.`soap:Body`[1].ExecuteSqlResponse[1].ExecuteSqlResult[1].`diffgr:diffgram`[1].`diffgr:before`[1].ResultTable[2].EXPR_1[1] = "V1Archive") & (16.`soap:Envelope`.`soap:Body`[1].ExecuteSqlResponse[1].ExecuteSqlResult[1].`diffgr:diffgram`[1].`diffgr:before`[1].ResultTable[2].EXPR_1[1] != "V2History" & 16.`soap:Envelope`.`soap:Body`[1].ExecuteSqlResponse[1].ExecuteSqlResult[1].`diffgr:diffgram`[1].`diffgr:before`[1].ResultTable[2].EXPR_1[1] != "V2Archive" & 16.`soap:Envelope`.`soap:Body`[1].ExecuteSqlResponse[1].ExecuteSqlResult[1].`diffgr:diffgram`[1].`diffgr:before`[1].ResultTable[3].EXPR_1[1] != "V2History" & 16.`soap:Envelope`.`soap:Body`[1].ExecuteSqlResponse[1].ExecuteSqlResult[1].`diffgr:diffgram`[1].`diffgr:before`[1].ResultTable[3].EXPR_1[1] != "V2Archive")); 2.field_7617_raw + "TransferTo" + 2.field_7616_raw; if(((16.`soap:Envelope`.`soap:Body`[1].ExecuteSqlResponse[1].ExecuteSqlResult[1].`diffgr:diffgram`[1].`diffgr:before`[1].ResultTable[1].EXPR_1[1] != "V1History" & 16.`soap:Envelope`.`soap:Body`[1].ExecuteSqlResponse[1].ExecuteSqlResult[1].`diffgr:diffgram`[1].`diffgr:before`[1].ResultTable[1].EXPR_1[1] != "V1Archive") & (16.`soap:Envelope`.`soap:Body`[1].ExecuteSqlResponse[1].ExecuteSqlResult[1].`diffgr:diffgram`[1].`diffgr:before`[1].ResultTable[1].EXPR_1[1] = "V2History" | 16.`soap:Envelope`.`soap:Body`[1].ExecuteSqlResponse[1].ExecuteSqlResult[1].`diffgr:diffgram`[1].`diffgr:before`[1].ResultTable[1].EXPR_1[1] = "V2Archive" | 16.`soap:Envelope`.`soap:Body`[1].ExecuteSqlResponse[1].ExecuteSqlResult[1].`diffgr:diffgram`[1].`diffgr:before`[1].ResultTable[2].EXPR_1[1] = "V2History" | 16.`soap:Envelope`.`soap:Body`[1].ExecuteSqlResponse[1].ExecuteSqlResult[1].`diffgr:diffgram`[1].`diffgr:before`[1].ResultTable[2].EXPR_1[1] = "V2Archive" | 16.`soap:Envelope`.`soap:Body`[1].ExecuteSqlResponse[1].ExecuteSqlResult[1].`diffgr:diffgram`[1].`diffgr:before`[1].ResultTable[3].EXPR_1[1] = "V2History" | 16.`soap:Envelope`.`soap:Body`[1].ExecuteSqlResponse[1].ExecuteSqlResult[1].`diffgr:diffgram`[1].`diffgr:before`[1].ResultTable[3].EXPR_1[1] = "V2Archive")); 2.field_7616_raw + "TransferTo" + 2.field_7617_raw; if(((16.`soap:Envelope`.`soap:Body`[1].ExecuteSqlResponse[1].ExecuteSqlResult[1].`diffgr:diffgram`[1].`diffgr:before`[1].ResultTable[1].EXPR_1[1] = "V1History" | 16.`soap:Envelope`.`soap:Body`[1].ExecuteSqlResponse[1].ExecuteSqlResult[1].`diffgr:diffgram`[1].`diffgr:before`[1].ResultTable[1].EXPR_1[1] = "V1Archive") & (16.`soap:Envelope`.`soap:Body`[1].ExecuteSqlResponse[1].ExecuteSqlResult[1].`diffgr:diffgram`[1].`diffgr:before`[1].ResultTable[2].EXPR_1[1] = "V2History" | 16.`soap:Envelope`.`soap:Body`[1].ExecuteSqlResponse[1].ExecuteSqlResult[1].`diffgr:diffgram`[1].`diffgr:before`[1].ResultTable[2].EXPR_1[1] = "V2Archive" | 16.`soap:Envelope`.`soap:Body`[1].ExecuteSqlResponse[1].ExecuteSqlResult[1].`diffgr:diffgram`[1].`diffgr:before`[1].ResultTable[3].EXPR_1[1] = "V2History" | 16.`soap:Envelope`.`soap:Body`[1].ExecuteSqlResponse[1].ExecuteSqlResult[1].`diffgr:diffgram`[1].`diffgr:before`[1].ResultTable[3].EXPR_1[1] = "V2Archive")); if(16.`soap:Envelope`.`soap:Body`[].ExecuteSqlResponse[].ExecuteSqlResult[].`diffgr:diffgram`[].`diffgr:before`[].ResultTable[].DateOfService[] > if((16.`soap:Envelope`.`soap:Body`[1].ExecuteSqlResponse[1].ExecuteSqlResult[1].`diffgr:diffgram`[1].`diffgr:before`[1].ResultTable[2].EXPR_1[1] = "V2History" | 16.`soap:Envelope`.`soap:Body`[1].ExecuteSqlResponse[1].ExecuteSqlResult[1].`diffgr:diffgram`[1].`diffgr:before`[1].ResultTable[2].EXPR_1[1] = "V2Archive"); 16.`soap:Envelope`.`soap:Body`[1].ExecuteSqlResponse[1].ExecuteSqlResult[1].`diffgr:diffgram`[1].`diffgr:before`[1].ResultTable[2].DateOfService[1]; 16.`soap:Envelope`.`soap:Body`[1].ExecuteSqlResponse[1].ExecuteSqlResult[1].`diffgr:diffgram`[1].`diffgr:before`[1].ResultTable[3].DateOfService[1]); 2.field_7617_raw + "TransferTo" + 2.field_7616_raw; 2.field_7616_raw + "TransferTo" + 2.field_7617_raw); if(2.field_7584_raw != null & 2.field_7585_raw = null; 2.field_7617_raw + "TransferTo" + 2.field_7616_raw; if(2.field_7584_raw = null & 2.field_7585_raw != null; 2.field_7616_raw + "TransferTo" + 2.field_7617_raw; if(2.field_7584_raw = null & 2.field_7585_raw = null; if(2.field_7616_raw > 2.field_7617_raw; 2.field_7617_raw + "TransferTo" + 2.field_7616_raw; 2.field_7616_raw + "TransfeTo" + 2.field_7617_raw); if((12.data.vehicle.vin = 2.field_7584_raw & 12.data.vehicle.vin != 2.field_7585_raw); 2.field_7617_raw + "TransferTo" + 2.field_7616_raw; if((12.data.vehicle.vin != 2.field_7584_raw & 12.data.vehicle.vin = 2.field_7585_raw); 2.field_7616_raw + "TransferTo" + 2.field_7617_raw; if(2.field_7616_raw > 2.field_7617_raw; 2.field_7617_raw + "TransferTo" + 2.field_7616_raw; 2.field_7616_raw + "TransfeTo" + 2.field_7617_raw)))))))))))}}

/* Case 1- solved*/

{{2.field_7614_raw != "No" & 2.field_7615_raw = "No"}}

{{2.field_7617_raw}}TransferTo{{2.field_7616_raw}}

{{if(2.field_7614_raw != "No" & 2.field_7615_raw = "No"; 2.field_7617_raw + "TransferTo" + 2.field_7616_raw; )}}


/* Case 2 - solved*/

{{2.field_7614_raw = "No" & 2.field_7615_raw != "No"}}
{{2.field_7616_raw}}TransferTo{{2.field_7617_raw}}

{{if(2.field_7614_raw = "No" & 2.field_7615_raw != "No"; 2.field_7616_raw + "TransferTo" + 2.field_7617_raw; )}}

/* Case 3*- entry point to history - if both have history or no history*/
{{2.field_7614_raw = "No" & 2.field_7615_raw = "No"}}
{{2.field_7614_raw = "YES" & 2.field_7615_raw = "YES"}}

      /* FOR HISTORY YOU NEED TO CHECK MK_00_SERVICEHISTORYARCHIVE AND MK_00_SERVICEHISTORY!!!! */
     /* Case 3.1 History - V1H - V2 - Solved*/
     {{(16.`soap:Envelope`.`soap:Body`[1].ExecuteSqlResponse[1].ExecuteSqlResult[1].`diffgr:diffgram`[1].`diffgr:before`[1].ResultTable[1].EXPR_1[1] = "V1History" | 16.`soap:Envelope`.`soap:Body`[1].ExecuteSqlResponse[1].ExecuteSqlResult[1].`diffgr:diffgram`[1].`diffgr:before`[1].ResultTable[2].EXPR_1[1] = "V1Archive")}}
     {{(16.`soap:Envelope`.`soap:Body`[1].ExecuteSqlResponse[1].ExecuteSqlResult[1].`diffgr:diffgram`[1].`diffgr:before`[1].ResultTable[2].EXPR_1[1] != "V2History" & 16.`soap:Envelope`.`soap:Body`[1].ExecuteSqlResponse[1].ExecuteSqlResult[1].`diffgr:diffgram`[1].`diffgr:before`[1].ResultTable[2].EXPR_1[1] != "V2Archive" & 16.`soap:Envelope`.`soap:Body`[1].ExecuteSqlResponse[1].ExecuteSqlResult[1].`diffgr:diffgram`[1].`diffgr:before`[1].ResultTable[3].EXPR_1[1] != "V2History" & 16.`soap:Envelope`.`soap:Body`[1].ExecuteSqlResponse[1].ExecuteSqlResult[1].`diffgr:diffgram`[1].`diffgr:before`[1].ResultTable[3].EXPR_1[1] != "V2Archive")}}
     {{((16.`soap:Envelope`.`soap:Body`[1].ExecuteSqlResponse[1].ExecuteSqlResult[1].`diffgr:diffgram`[1].`diffgr:before`[1].ResultTable[1].EXPR_1[1] = "V1History" | 16.`soap:Envelope`.`soap:Body`[1].ExecuteSqlResponse[1].ExecuteSqlResult[1].`diffgr:diffgram`[1].`diffgr:before`[1].ResultTable[2].EXPR_1[1] = "V1Archive") & (16.`soap:Envelope`.`soap:Body`[1].ExecuteSqlResponse[1].ExecuteSqlResult[1].`diffgr:diffgram`[1].`diffgr:before`[1].ResultTable[2].EXPR_1[1] != "V2History" & 16.`soap:Envelope`.`soap:Body`[1].ExecuteSqlResponse[1].ExecuteSqlResult[1].`diffgr:diffgram`[1].`diffgr:before`[1].ResultTable[2].EXPR_1[1] != "V2Archive" & 16.`soap:Envelope`.`soap:Body`[1].ExecuteSqlResponse[1].ExecuteSqlResult[1].`diffgr:diffgram`[1].`diffgr:before`[1].ResultTable[3].EXPR_1[1] != "V2History" & 16.`soap:Envelope`.`soap:Body`[1].ExecuteSqlResponse[1].ExecuteSqlResult[1].`diffgr:diffgram`[1].`diffgr:before`[1].ResultTable[3].EXPR_1[1] != "V2Archive"))}}
     {{if(((16.`soap:Envelope`.`soap:Body`[1].ExecuteSqlResponse[1].ExecuteSqlResult[1].`diffgr:diffgram`[1].`diffgr:before`[1].ResultTable[1].EXPR_1[1] = "V1History" | 16.`soap:Envelope`.`soap:Body`[1].ExecuteSqlResponse[1].ExecuteSqlResult[1].`diffgr:diffgram`[1].`diffgr:before`[1].ResultTable[2].EXPR_1[1] = "V1Archive") & (16.`soap:Envelope`.`soap:Body`[1].ExecuteSqlResponse[1].ExecuteSqlResult[1].`diffgr:diffgram`[1].`diffgr:before`[1].ResultTable[2].EXPR_1[1] != "V2History" & 16.`soap:Envelope`.`soap:Body`[1].ExecuteSqlResponse[1].ExecuteSqlResult[1].`diffgr:diffgram`[1].`diffgr:before`[1].ResultTable[2].EXPR_1[1] != "V2Archive" & 16.`soap:Envelope`.`soap:Body`[1].ExecuteSqlResponse[1].ExecuteSqlResult[1].`diffgr:diffgram`[1].`diffgr:before`[1].ResultTable[3].EXPR_1[1] != "V2History" & 16.`soap:Envelope`.`soap:Body`[1].ExecuteSqlResponse[1].ExecuteSqlResult[1].`diffgr:diffgram`[1].`diffgr:before`[1].ResultTable[3].EXPR_1[1] != "V2Archive")); 2.field_7617_raw + "TransferTo" + 2.field_7616_raw; )}}


     /* Case 3.2 History - V1 - V2H- Solved*/
     {{(16.`soap:Envelope`.`soap:Body`[1].ExecuteSqlResponse[1].ExecuteSqlResult[1].`diffgr:diffgram`[1].`diffgr:before`[1].ResultTable[1].EXPR_1[1] != "V1History" & 16.`soap:Envelope`.`soap:Body`[1].ExecuteSqlResponse[1].ExecuteSqlResult[1].`diffgr:diffgram`[1].`diffgr:before`[1].ResultTable[1].EXPR_1[1] != "V1Archive")}}
     {{(16.`soap:Envelope`.`soap:Body`[1].ExecuteSqlResponse[1].ExecuteSqlResult[1].`diffgr:diffgram`[1].`diffgr:before`[1].ResultTable[1].EXPR_1[1] = "V2History" | 16.`soap:Envelope`.`soap:Body`[1].ExecuteSqlResponse[1].ExecuteSqlResult[1].`diffgr:diffgram`[1].`diffgr:before`[1].ResultTable[1].EXPR_1[1] = "V2Archive" | 16.`soap:Envelope`.`soap:Body`[1].ExecuteSqlResponse[1].ExecuteSqlResult[1].`diffgr:diffgram`[1].`diffgr:before`[1].ResultTable[2].EXPR_1[1] = "V2History" | 16.`soap:Envelope`.`soap:Body`[1].ExecuteSqlResponse[1].ExecuteSqlResult[1].`diffgr:diffgram`[1].`diffgr:before`[1].ResultTable[2].EXPR_1[1] = "V2Archive" | 16.`soap:Envelope`.`soap:Body`[1].ExecuteSqlResponse[1].ExecuteSqlResult[1].`diffgr:diffgram`[1].`diffgr:before`[1].ResultTable[3].EXPR_1[1] = "V2History" | 16.`soap:Envelope`.`soap:Body`[1].ExecuteSqlResponse[1].ExecuteSqlResult[1].`diffgr:diffgram`[1].`diffgr:before`[1].ResultTable[3].EXPR_1[1] = "V2Archive")}}
     {{if(((16.`soap:Envelope`.`soap:Body`[1].ExecuteSqlResponse[1].ExecuteSqlResult[1].`diffgr:diffgram`[1].`diffgr:before`[1].ResultTable[1].EXPR_1[1] != "V1History" & 16.`soap:Envelope`.`soap:Body`[1].ExecuteSqlResponse[1].ExecuteSqlResult[1].`diffgr:diffgram`[1].`diffgr:before`[1].ResultTable[1].EXPR_1[1] != "V1Archive") & (16.`soap:Envelope`.`soap:Body`[1].ExecuteSqlResponse[1].ExecuteSqlResult[1].`diffgr:diffgram`[1].`diffgr:before`[1].ResultTable[1].EXPR_1[1] = "V2History" | 16.`soap:Envelope`.`soap:Body`[1].ExecuteSqlResponse[1].ExecuteSqlResult[1].`diffgr:diffgram`[1].`diffgr:before`[1].ResultTable[1].EXPR_1[1] = "V2Archive" | 16.`soap:Envelope`.`soap:Body`[1].ExecuteSqlResponse[1].ExecuteSqlResult[1].`diffgr:diffgram`[1].`diffgr:before`[1].ResultTable[2].EXPR_1[1] = "V2History" | 16.`soap:Envelope`.`soap:Body`[1].ExecuteSqlResponse[1].ExecuteSqlResult[1].`diffgr:diffgram`[1].`diffgr:before`[1].ResultTable[2].EXPR_1[1] = "V2Archive" | 16.`soap:Envelope`.`soap:Body`[1].ExecuteSqlResponse[1].ExecuteSqlResult[1].`diffgr:diffgram`[1].`diffgr:before`[1].ResultTable[3].EXPR_1[1] = "V2History" | 16.`soap:Envelope`.`soap:Body`[1].ExecuteSqlResponse[1].ExecuteSqlResult[1].`diffgr:diffgram`[1].`diffgr:before`[1].ResultTable[3].EXPR_1[1] = "V2Archive")); 2.field_7616_raw + "TransferTo" + 2.field_7617_raw; )}}
     
-------1----
     /* Case 3.3 History - V1H - V2H - entry point into chassis and same with 3.4*/
     {{(16.`soap:Envelope`.`soap:Body`[1].ExecuteSqlResponse[1].ExecuteSqlResult[1].`diffgr:diffgram`[1].`diffgr:before`[1].ResultTable[1].EXPR_1[1] = "V1History" | 16.`soap:Envelope`.`soap:Body`[1].ExecuteSqlResponse[1].ExecuteSqlResult[1].`diffgr:diffgram`[1].`diffgr:before`[1].ResultTable[1].EXPR_1[1] = "V1Archive")}}
     {{(16.`soap:Envelope`.`soap:Body`[1].ExecuteSqlResponse[1].ExecuteSqlResult[1].`diffgr:diffgram`[1].`diffgr:before`[1].ResultTable[2].EXPR_1[1] = "V2History" | 16.`soap:Envelope`.`soap:Body`[1].ExecuteSqlResponse[1].ExecuteSqlResult[1].`diffgr:diffgram`[1].`diffgr:before`[1].ResultTable[2].EXPR_1[1] = "V2Archive" | 16.`soap:Envelope`.`soap:Body`[1].ExecuteSqlResponse[1].ExecuteSqlResult[1].`diffgr:diffgram`[1].`diffgr:before`[1].ResultTable[3].EXPR_1[1] = "V2History" | 16.`soap:Envelope`.`soap:Body`[1].ExecuteSqlResponse[1].ExecuteSqlResult[1].`diffgr:diffgram`[1].`diffgr:before`[1].ResultTable[3].EXPR_1[1] = "V2Archive")}}
     {{((16.`soap:Envelope`.`soap:Body`[1].ExecuteSqlResponse[1].ExecuteSqlResult[1].`diffgr:diffgram`[1].`diffgr:before`[1].ResultTable[1].EXPR_1[1] = "V1History" | 16.`soap:Envelope`.`soap:Body`[1].ExecuteSqlResponse[1].ExecuteSqlResult[1].`diffgr:diffgram`[1].`diffgr:before`[1].ResultTable[1].EXPR_1[1] = "V1Archive") & (16.`soap:Envelope`.`soap:Body`[1].ExecuteSqlResponse[1].ExecuteSqlResult[1].`diffgr:diffgram`[1].`diffgr:before`[1].ResultTable[2].EXPR_1[1] = "V2History" | 16.`soap:Envelope`.`soap:Body`[1].ExecuteSqlResponse[1].ExecuteSqlResult[1].`diffgr:diffgram`[1].`diffgr:before`[1].ResultTable[2].EXPR_1[1] = "V2Archive" | 16.`soap:Envelope`.`soap:Body`[1].ExecuteSqlResponse[1].ExecuteSqlResult[1].`diffgr:diffgram`[1].`diffgr:before`[1].ResultTable[3].EXPR_1[1] = "V2History" | 16.`soap:Envelope`.`soap:Body`[1].ExecuteSqlResponse[1].ExecuteSqlResult[1].`diffgr:diffgram`[1].`diffgr:before`[1].ResultTable[3].EXPR_1[1] = "V2Archive"))}}
          /* Case 3.3.1 History - V1H - V2H - V1H > V2H OR V1H < V2H*/
         {{if(; 2.field_7617_raw + "TransferTo" + 2.field_7616_raw; 2.field_7616_raw + "TransferTo" + 2.field_7617_raw)}}
         {{if((16.`soap:Envelope`.`soap:Body`[1].ExecuteSqlResponse[1].ExecuteSqlResult[1].`diffgr:diffgram`[1].`diffgr:before`[1].ResultTable[2].EXPR_1[1] = "V2History" | 16.`soap:Envelope`.`soap:Body`[1].ExecuteSqlResponse[1].ExecuteSqlResult[1].`diffgr:diffgram`[1].`diffgr:before`[1].ResultTable[2].EXPR_1[1] = "V2Archive"); 16.`soap:Envelope`.`soap:Body`[1].ExecuteSqlResponse[1].ExecuteSqlResult[1].`diffgr:diffgram`[1].`diffgr:before`[1].ResultTable[2].DateOfService[1]; 16.`soap:Envelope`.`soap:Body`[1].ExecuteSqlResponse[1].ExecuteSqlResult[1].`diffgr:diffgram`[1].`diffgr:before`[1].ResultTable[3].DateOfService[1])}}
         
         {{if(16.`soap:Envelope`.`soap:Body`[].ExecuteSqlResponse[].ExecuteSqlResult[].`diffgr:diffgram`[].`diffgr:before`[].ResultTable[].DateOfService[] > if((16.`soap:Envelope`.`soap:Body`[1].ExecuteSqlResponse[1].ExecuteSqlResult[1].`diffgr:diffgram`[1].`diffgr:before`[1].ResultTable[2].EXPR_1[1] = "V2History" | 16.`soap:Envelope`.`soap:Body`[1].ExecuteSqlResponse[1].ExecuteSqlResult[1].`diffgr:diffgram`[1].`diffgr:before`[1].ResultTable[2].EXPR_1[1] = "V2Archive"); 16.`soap:Envelope`.`soap:Body`[1].ExecuteSqlResponse[1].ExecuteSqlResult[1].`diffgr:diffgram`[1].`diffgr:before`[1].ResultTable[2].DateOfService[1]; 16.`soap:Envelope`.`soap:Body`[1].ExecuteSqlResponse[1].ExecuteSqlResult[1].`diffgr:diffgram`[1].`diffgr:before`[1].ResultTable[3].DateOfService[1]); 2.field_7617_raw + "TransferTo" + 2.field_7616_raw; 2.field_7616_raw + "TransferTo" + 2.field_7617_raw)}}
/* Case 3.4 History - V1 - V2 - entry point into chassis and same with*/
     
    
     /* Case 3.1 Chassis - solved*/
     {{2.field_7584_raw != null & 2.field_7585_raw = null}}
     {{if(2.field_7584_raw != null & 2.field_7585_raw = null; 2.field_7617_raw + "TransferTo" + 2.field_7616_raw; )}}

     /* Case 3.2 Chassis - solved*/
     {{2.field_7584_raw = null & 2.field_7585_raw != null}}
     {{if(2.field_7584_raw = null & 2.field_7585_raw != null; 2.field_7616_raw + "TransferTo" + 2.field_7617_raw; )}}
     
     {{2.field_7616_raw}}TransferTo{{2.field_7617_raw}}

     /* Case 3.3 Chassis- solved - entry point into cassis will need an if statement*/
      /* if statement condition*/
     {{if(2.field_7584_raw = null & 2.field_7585_raw = null; 2.field_7616_raw + "TransferTo" + 2.field_7617_raw; )}}
      /* if statement left outcome, the righth will continue with the chassis*/
     {{if(2.field_7584_raw = null & 2.field_7585_raw = null; if(2.field_7616_raw > 2.field_7617_raw; 2.field_7617_raw + "TransferTo" + 2.field_7616_raw; 2.field_7616_raw + "TransfeTo" + 2.field_7617_raw); )}}
     

/* Case 3.4 Chassis (different)- YOU NEED THE CORRRECT CHASSIS - No need for if statement*/
     {{2.field_7584_raw != null & 2.field_7585_raw != null}}
   
         
          /* Case 3.4.1 Chassis (different)-correct vin is in V1- solved*/
         {{(12.data.vehicle.vin = 2.field_7584_raw & 12.data.vehicle.vin != 2.field_7585_raw)}}
         {{if((12.data.vehicle.vin = 2.field_7584_raw & 12.data.vehicle.vin != 2.field_7585_raw); 2.field_7617_raw + "TransferTo" + 2.field_7616_raw; )}}


     ------------------     
          /* Case 3.4.2 Chassis (different)-correct vin is in V2 - solved*/
          {{(12.data.vehicle.vin != 2.field_7584_raw & 12.data.vehicle.vin = 2.field_7585_raw)}}
          {{if((12.data.vehicle.vin != 2.field_7584_raw & 12.data.vehicle.vin = 2.field_7585_raw); 2.field_7616_raw + "TransferTo" + 2.field_7617_raw; )}}

          /* Case 3.4.3 Chassis (different)-correct vin is not in V1 or V2- solved -final string for chassiss - The final sctring to close the search*/
          {{if(2.field_7616_raw > 2.field_7617_raw; 2.field_7617_raw + "TransferTo" + 2.field_7616_raw; 2.field_7616_raw + "TransfeTo" + 2.field_7617_raw)}}

           
    
/* Vehicle number comparison and select*/
{{if(2.field_7616_raw > 2.field_7617_raw; 2.field_7617_raw + "TransferTo" + 2.field_7616_raw; 2.field_7616_raw + "TransfeTo" + 2.field_7617_raw)}}









/**********************************************************************************************************************************************************************************************************************************************************************************************************8*/

/*DEVELOPMENT CODE*/

