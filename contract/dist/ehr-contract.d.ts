import { Context, Contract } from "fabric-contract-api";
declare type Success = {
    Success: string;
};
export declare class EHRContract extends Contract {
    init(ctx: Context): Promise<void>;
    myAssetExists(ctx: Context, myAssetId: string): Promise<boolean>;
    createMyAsset(ctx: Context, myAssetId: string, value: string): Promise<void>;
    readMyAsset(ctx: Context, args: string): Promise<any>;
    checkMyAsset(ctx: Context, args: string): Promise<{
        error: string;
        Success?: undefined;
    } | {
        Success: string;
        error?: undefined;
    }>;
    updateMyAsset(ctx: any, myAssetId: any, newValue: any): Promise<void>;
    deleteMyAsset(ctx: any, myAssetId: any): Promise<void>;
    printSomething(ctx: Context, text: string): Promise<JSON>;
    createPatient(ctx: Context, args: string): Promise<Success>;
    createDoctor(ctx: Context, args: string): Promise<Success>;
    createReport(ctx: Context, args: string): Promise<Success>;
    queryByObjectType(ctx: Context, objectType: string): Promise<string>;
    queryWithQueryString(ctx: Context, queryString: string): Promise<string>;
    checkExist(ctx: Context, query: string): Promise<string>;
    getPatients(ctx: Context): Promise<string>;
    getDoctors(ctx: Context): Promise<string>;
    getReports(ctx: Context): Promise<string>;
    getReportFromId(ctx: Context, args: string): Promise<any>;
    requestAccess(ctx: Context, args: string): Promise<Success>;
    grantAccess(ctx: Context, args: string): Promise<Success>;
    rejectAccess(ctx: Context, args: string): Promise<Success>;
    resetAccess(ctx: Context, args: string): Promise<Success>;
    getReportData(ctx: Context, args: string): Promise<any>;
}
export {};
