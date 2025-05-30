import { db } from "@/lib/db";
import { files } from "@/lib/db/schema";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
        }
        //parse the request body
        const body = await request.json();
        const {imagekit, userId: bodyUserId} = body;

        if(bodyUserId !== userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        if(!imagekit || !imagekit.url) {
            return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
        }

        const fileData = { 
            name: imagekit.name || "untitled",
            path: imagekit.filePath || `/droply/${userId}/${imagekit.name}`,
            userId: userId,
            size: imagekit.size || 0,
            type: imagekit.type || "image",
            fileUrl: imagekit.url,
            thumbnailUrl: imagekit.thumbnailUrl || null,
            parentId: null,  //root level by default
            isFolder: false,
            isStarred: false,
            isTrash: false,
        };

        const newFile = await db.insert(files).values(fileData);
        return NextResponse.json(newFile, { status: 201 });

    } catch (error) {
        return new Response(JSON.stringify({ error: "Failed to authenticate" }), { status: 500 });
    }
}