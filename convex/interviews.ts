import { v } from "convex/values";
import { mutation, query } from "./_generated/server";


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


export const getInterviewByStreamCallId = query({
    args:{ streamCallId:v.string()},
    handler: async(ctx,args)=>{

        return ctx.db.query("interviews")
        .withIndex("by_stream_call_id", (q)=> q.eq("streamCallId",args.streamCallId))
    }
})

export const createInterview = mutation({
    args:{
        title: v.string(),
        description: v.optional(v.string()),
        startTime:v.number(),
        status:v.string(),
        streamCallId:v.string(),
        candidateId:v.string(),
        interviewerIds:v.array(v.string()),
    },
    handler:async(ctx,args)=>{
        const identity = await ctx.auth.getUserIdentity();
        if(!identity) throw new Error ("Unauthorized user");


        return await ctx.db.insert("interviews",{
            ...args,
        });
    }
})


export const updateInterviewStatus = mutation({
    args:{
        id:v.id("interviews"),
        status:v.string(),
    },
    handler:async(ctx,args)=>{
        return await ctx.db.patch(args.id,{
            status:args.status,
            ...(args.status === "completed"?{endTime:Date.now()}:{})
        })
    }
})