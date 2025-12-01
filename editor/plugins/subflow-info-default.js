RED.plugins.registerPlugin("subflow-info-default", {
    type: "editor",
    oneditprepare: function () {

        // Fires when ANY node's edit dialog is opened
        RED.events.on("editor:show", function(node) {
            if (!node) return;

            // Only act on subflow INSTANCE nodes
            if (!node.type.startsWith("subflow:")) return;

            // Do not overwrite user-provided description
            if (node.info && node.info.trim() !== "") return;

            // Get the subflow template definition
            const templateId = node.type.substring("subflow:".length);
            const template = RED.nodes.getType(templateId);
            if (!template) return;

            // Copy template description into instance
            node.info = template.info || "";
        });
    }
});
