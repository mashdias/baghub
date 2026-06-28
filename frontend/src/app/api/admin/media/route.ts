import { NextResponse } from 'next/server';
import { writeFile, readdir, unlink, stat } from 'fs/promises';
import { join } from 'path';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const uploadDir = join(process.cwd(), 'public', 'uploads');
    
    // Ensure dir exists, if not, return empty array
    try {
      await stat(uploadDir);
    } catch {
      return NextResponse.json({ files: [] });
    }

    const files = await readdir(uploadDir);
    const fileStats = await Promise.all(
      files.map(async (filename) => {
        const stats = await stat(join(uploadDir, filename));
        return {
          name: filename,
          url: `/uploads/${filename}`,
          size: stats.size,
          createdAt: stats.birthtime,
        };
      })
    );

    // Sort by newest
    fileStats.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    return NextResponse.json({ files: fileStats });
  } catch (error) {
    console.error('Media GET error:', error);
    return NextResponse.json({ error: 'Failed to list media' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file received' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const originalName = file.name.replace(/[^a-zA-Z0-9.-]/g, '');
    const filename = `${uniqueSuffix}-${originalName}`;
    
    const uploadDir = join(process.cwd(), 'public', 'uploads');
    const filepath = join(uploadDir, filename);
    await writeFile(filepath, buffer);

    const stats = await stat(filepath);

    return NextResponse.json({ 
      file: {
        name: filename,
        url: `/uploads/${filename}`,
        size: stats.size,
        createdAt: stats.birthtime,
      }
    }, { status: 201 });
  } catch (error) {
    console.error('Media POST error:', error);
    return NextResponse.json({ error: 'Failed to upload' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { filename } = await req.json();
    if (!filename) {
      return NextResponse.json({ error: 'Filename is required' }, { status: 400 });
    }

    // Security: prevent directory traversal by removing slashes
    const safeFilename = filename.replace(/[^a-zA-Z0-9.-]/g, '');
    const filepath = join(process.cwd(), 'public', 'uploads', safeFilename);
    
    await unlink(filepath);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Media DELETE error:', error);
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
  }
}
