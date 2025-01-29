import { httpRouter } from "convex/server";
import {httpAction} from './_generated/server'
import {WebhookEvent} from '@clerk/nextjs/server'
import {Webhook} from "svix"

 const http = httpRouter();

 http.route({
     path: "/clerk-webhook",
     method: "POST", 
     handler: httpAction(async (ctx, request)=>{
        const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;
        if(!webhookSecret){
            throw new Error ("Missing CLERK_WEBHOOK_SECRET environment variable")
        }
        const svix_id = request.headers.get("svix-id")
        const svix_signature = request.headers.get("svix-signature")
        const svix_timestamp = request.headers.get("svix-timestamp")

        if(!svix_id || !svix_signature || !svix_timestamp){
            return new Response ("No svix headers found",{
                status:400
            })
        }

        const payload = await request.json()
        const body = JSON.stringify(payload);

        const wh = new Webhook(webhookSecret)
        let evt : WebhookEvent


        try{
            evt = wh.verify(body,{
                "svix-id":svix_id,
                "svix-signature":svix_signature,
                "svix-timestamp":svix_timestamp
            }) as WebhookEvent;
        } catch (err){
            console.log("Error verifying webhook",err);
            return new Response("Error occurred",{status:400})
        }
         

     })
 })