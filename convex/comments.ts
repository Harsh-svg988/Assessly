import { mutation } from "./_generated/server";
import { v } from 'convex/values';

const addComment = mutation({
    args: {
        content: v.string(),
        rating: v.number(),
        interviewId: v.id("interviews"),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Unauthorized");

        return await ctx.db.insert("comments", {
            interviewId: args.interviewId,
            content: args.content,
            rating: args.rating,
            interviewerId: identity.subject,
        });
    },
});

export default addComment;