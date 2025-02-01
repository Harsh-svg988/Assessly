import { query } from "./_generated/server";


export const getAllInterviews = query({
    handler: async(ctx)=>{
        const identity = await ctx.auth.getUserIdentity();
        if(!identity) throw new Error ("Unauthorized user");

        const interviews = await ctx.db.query("interviews").collect();

        return interviews;

    }
});

export const getMyInterview = query({
    handler: async(ctx)=>{
        const identity = await ctx.auth.getUserIdentity();
        if(!identity) throw new Error ("Unauthorized user");

        const interview = await ctx.db.query("interviews")
        .withIndex("by_candidate_id", (q)=>q.eq("candidateId",identity.subject))
    }
})