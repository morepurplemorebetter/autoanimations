// Support submitted by FilippoPolo on GitHub

import { trafficCop }       from "../router/traffic-cop.js"
import AAHandler            from "../system-handlers/workflow-data.js";
import { getRequiredData }  from "./getRequiredData.js";

export function systemHooks() {
    Hooks.on("createChatMessage", async (msg) => {
        if (msg.user.id !== game.user.id) { return };
        const flags = msg.flags?.["dark-heresy"] ?? {};
        if(!flags.rollData) return;
        if(flags.rollData.evasions) return;
        const itemId = flags.rollData.itemId;
        const tokenId = flags.rollData.tokenId;
        const actorId = flags.rollData.ownerId;
        const rollClass = flags.rollData.rollObject.class;
        routeMessage({itemId, tokenId, actorId, workflow: msg, rollClass})
    });
    Hooks.on("AutomatedAnimations-WorkflowStart", onWorkflowStart);
    Hooks.on("createMeasuredTemplate", async (template, data, userId) => {
        if (userId !== game.user.id) { return };
        templateAnimation(await getRequiredData({itemUuid: template.flags?.["dark-heresy"]?.origin, templateData: template, workflow: template, isTemplate: true}))
    })
}

async function routeMessage(input) {
    const requiredData = await getRequiredData(input);
    if (!requiredData.item) { return; }
    runDarkHeresy(requiredData);
}

async function runDarkHeresy(data) {
    const handler = await AAHandler.make(data)
    trafficCop(handler);
}

function onWorkflowStart(clonedData, animationData) {
    // Repeat the animation in case of burst attacks.
    if (animationData.primary != null && clonedData.workflow.flags["dark-heresy"].rollData.attackType?.maxHits > 1) {
        animationData.primary.options.repeat = clonedData.workflow.flags["dark-heresy"].rollData.attackType.maxHits;
        animationData.primary.options.repeatDelay = 500 / clonedData.workflow.flags["dark-heresy"].rollData.attackType.maxHits
    }
}

async function templateAnimation(input) {
    if (!input.item) { 
        return;
    }
    const handler = await AAHandler.make(input)
    trafficCop(handler)
}