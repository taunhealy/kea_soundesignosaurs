import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { ContentType } from "@prisma/client";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const contentType = searchParams.get("contentType") as ContentType;

  console.log("Content Type:", contentType);

  const genres = searchParams.get("genres")?.split(",").filter(Boolean) || [];
  const vstTypes =
    searchParams.get("vstTypes")?.split(",").filter(Boolean) || [];
  const presetTypes =
    searchParams.get("presetTypes")?.split(",").filter(Boolean) || [];
  const searchTerm = searchParams.get("searchTerm") || "";

  try {
    switch (contentType) {
      case ContentType.PRESETS:
        return await handlePresets(searchTerm, genres, vstTypes, presetTypes);
      case ContentType.PACKS:
        return await handlePacks(searchTerm, genres, vstTypes, presetTypes);
      case ContentType.REQUESTS:
        return await handleRequests(searchTerm);
      default:
        return NextResponse.json(
          { error: `Unsupported content type: ${contentType}` },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("Error fetching content:", error);
    return NextResponse.json(
      { error: "Failed to fetch content" },
      { status: 500 }
    );
  }
}

async function handlePresets(
  searchTerm: string,
  genres: string[],
  vstTypes: string[],
  presetTypes: string[]
) {
  const whereClause: any = {};
  const AND = [];

  if (searchTerm) {
    AND.push({
      OR: [
        { title: { contains: searchTerm, mode: "insensitive" } },
        { description: { contains: searchTerm, mode: "insensitive" } },
        { genre: { name: { contains: searchTerm, mode: "insensitive" } } },
        { tags: { hasSome: [searchTerm] } },
      ],
    });
  }

  if (genres.length > 0) AND.push({ genreId: { in: genres } });
  if (vstTypes.length > 0) AND.push({ vstId: { in: vstTypes } });
  if (presetTypes.length > 0) AND.push({ presetType: { in: presetTypes } });
  if (AND.length > 0) whereClause.AND = AND;

  const presets = await prisma.presetUpload.findMany({
    where: whereClause,
    include: {
      soundDesigner: {
        select: {
          username: true,
          profileImage: true,
        },
      },
      genre: true,
      vst: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(presets);
}

async function handlePacks(
  searchTerm: string,
  genres: string[],
  vstTypes: string[],
  presetTypes: string[]
) {
  const whereClause: any = {};
  const AND = [];

  if (searchTerm) {
    AND.push({
      OR: [
        { title: { contains: searchTerm, mode: "insensitive" } },
        { description: { contains: searchTerm, mode: "insensitive" } },
        {
          presets: {
            some: {
              OR: [
                { title: { contains: searchTerm, mode: "insensitive" } },
                { description: { contains: searchTerm, mode: "insensitive" } },
              ],
            },
          },
        },
      ],
    });
  }

  if (genres.length > 0) {
    AND.push({
      presets: {
        some: { genreId: { in: genres } },
      },
    });
  }
  if (vstTypes.length > 0) {
    AND.push({
      presets: {
        some: { vstId: { in: vstTypes } },
      },
    });
  }
  if (AND.length > 0) whereClause.AND = AND;

  const packs = await prisma.presetPackUpload.findMany({
    where: whereClause,
    include: {
      soundDesigner: {
        select: {
          username: true,
          profileImage: true,
        },
      },
      presets: {
        include: {
          preset: {
            include: {
              genre: true,
              vst: true,
            },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(packs);
}

async function handleRequests(searchTerm: string) {
  const whereClause: any = {};

  if (searchTerm) {
    whereClause.OR = [
      { title: { contains: searchTerm, mode: "insensitive" } },
      { description: { contains: searchTerm, mode: "insensitive" } },
    ];
  }

  const requests = await prisma.presetRequest.findMany({
    where: whereClause,
    include: {
      soundDesigner: {
        select: {
          username: true,
          profileImage: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(requests);
}
