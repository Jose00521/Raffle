import 'reflect-metadata';
import { PrizeCategoryController } from "@/server/controllers/PrizeCategoryController";
import { container } from "@/server/container/container";
import { createSuccessResponse } from "@/server/utils/errorHandler/api";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    const body = await req.json();
    console.log(body);
    const prizeCategoryController = container.resolve(PrizeCategoryController);
    const category = await prizeCategoryController.createCategory(body);
    return NextResponse.json(category, { status: 201 });
}

export async function GET(req: NextRequest) {
    const prizeCategoryController = container.resolve(PrizeCategoryController);
    const categories = await prizeCategoryController.getAllCategories();
    return NextResponse.json(categories, { status: 200 });
}
