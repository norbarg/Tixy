//src/types/comment.types.ts
export type CommentItem = {
    id: string;
    eventId: string;
    authorUserId: string;
    content: string;
    createdAt: string;
    eventTitle: string | null;
    authorLogin: string | null;
};
