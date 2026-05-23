import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

const VALID_SECTIONS = ['hero', 'description', 'items', 'notes', 'cta'] as const;
type Section = (typeof VALID_SECTIONS)[number];

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { slug, section, timeSpent, scrollDepth, sessionId } = body;

    if (!slug || typeof slug !== 'string') {
      return NextResponse.json({ error: 'slug required' }, { status: 400 });
    }
    if (!VALID_SECTIONS.includes(section)) {
      return NextResponse.json({ error: 'invalid section' }, { status: 400 });
    }
    if (typeof timeSpent !== 'number' || timeSpent < 0 || timeSpent > 3_600_000) {
      return NextResponse.json({ error: 'invalid timeSpent' }, { status: 400 });
    }

    const proposal = await prisma.proposal.findUnique({
      where: { slug },
      select: { id: true, status: true },
    });
    if (!proposal || proposal.status === 'DRAFT') {
      return NextResponse.json({ ok: false }, { status: 404 });
    }

    await prisma.proposalSectionView.create({
      data: {
        proposalId: proposal.id,
        section: section as Section,
        timeSpent: Math.floor(timeSpent),
        scrollDepth: typeof scrollDepth === 'number' ? Math.max(0, Math.min(100, scrollDepth)) : 0,
        sessionId: String(sessionId || 'anonymous').slice(0, 60),
      },
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('Track error:', err);
    return NextResponse.json({ error: 'internal' }, { status: 500 });
  }
}
