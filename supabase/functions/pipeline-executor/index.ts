
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { pipelineId, action, config } = await req.json()

    if (action === 'start') {
      // Start pipeline execution
      const { data: pipeline, error: pipelineError } = await supabase
        .from('automation_pipelines')
        .select('*')
        .eq('id', pipelineId)
        .single()

      if (pipelineError || !pipeline) {
        throw new Error('Pipeline nicht gefunden')
      }

      // Create execution record
      const { data: execution, error: executionError } = await supabase
        .from('pipeline_executions')
        .insert({
          pipeline_id: pipelineId,
          status: 'running',
          stages_progress: {}
        })
        .select()
        .single()

      if (executionError) throw executionError

      // Update pipeline status
      await supabase
        .from('automation_pipelines')
        .update({ 
          status: 'active',
          last_run_at: new Date().toISOString()
        })
        .eq('id', pipelineId)

      // Start background execution
      executeInBackground(supabase, pipeline, execution.id)

      return new Response(
        JSON.stringify({ success: true, executionId: execution.id }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (action === 'stop') {
      await supabase
        .from('automation_pipelines')
        .update({ status: 'inactive' })
        .eq('id', pipelineId)

      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    throw new Error('Unbekannte Action')

  } catch (error) {
    console.error('Pipeline execution error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})

async function executeInBackground(supabase: any, pipeline: any, executionId: string) {
  try {
    const stages = JSON.parse(pipeline.stages)
    
    for (let i = 0; i < stages.length; i++) {
      const stage = stages[i]
      
      // Update stage to running
      stage.status = 'running'
      await updateStageProgress(supabase, executionId, stages)
      
      // Simulate stage execution based on type
      await executeStage(supabase, pipeline.type, stage, pipeline.config)
      
      // Update stage to completed
      stage.status = 'completed'
      stage.progress = 100
      await updateStageProgress(supabase, executionId, stages)
      
      // Small delay between stages
      await new Promise(resolve => setTimeout(resolve, 1000))
    }

    // Mark execution as completed
    await supabase
      .from('pipeline_executions')
      .update({ 
        status: 'completed',
        completed_at: new Date().toISOString(),
        stages_progress: stages
      })
      .eq('id', executionId)

    // Update pipeline status
    await supabase
      .from('automation_pipelines')
      .update({ status: 'inactive' })
      .eq('id', pipeline.id)

  } catch (error) {
    console.error('Background execution error:', error)
    
    await supabase
      .from('pipeline_executions')
      .update({ 
        status: 'failed',
        error_message: error.message,
        completed_at: new Date().toISOString()
      })
      .eq('id', executionId)
  }
}

async function updateStageProgress(supabase: any, executionId: string, stages: any[]) {
  await supabase
    .from('pipeline_executions')
    .update({ stages_progress: stages })
    .eq('id', executionId)
}

async function executeStage(supabase: any, pipelineType: string, stage: any, config: any) {
  console.log(`Executing stage: ${stage.name} for pipeline type: ${pipelineType}`)
  
  switch (pipelineType) {
    case 'blog_creation':
      await executeBlogCreationStage(supabase, stage, config)
      break
    case 'recipe_generation':
      await executeRecipeGenerationStage(supabase, stage, config)
      break
    case 'seo_optimization':
      await executeSeoOptimizationStage(supabase, stage, config)
      break
    case 'content_analysis':
      await executeContentAnalysisStage(supabase, stage, config)
      break
  }
}

async function executeBlogCreationStage(supabase: any, stage: any, config: any) {
  switch (stage.id) {
    case 'content_creation':
      // Generate blog post using OpenAI
      await supabase.functions.invoke('generate-blog-post', {
        body: { 
          topic: 'Automatisch generierter Blog-Post',
          category: config.target_category || 'kochen'
        }
      })
      break
    default:
      // Simulate other stages
      await new Promise(resolve => setTimeout(resolve, stage.duration * 100))
  }
}

async function executeRecipeGenerationStage(supabase: any, stage: any, config: any) {
  switch (stage.id) {
    case 'recipe_creation':
      // Generate recipe using OpenAI
      await supabase.functions.invoke('generate-recipe', {
        body: { 
          dishName: 'Automatisch generiertes Rezept',
          category: config.target_category || 'kochen'
        }
      })
      break
    default:
      await new Promise(resolve => setTimeout(resolve, stage.duration * 100))
  }
}

async function executeSeoOptimizationStage(supabase: any, stage: any, config: any) {
  // Simulate SEO optimization
  await new Promise(resolve => setTimeout(resolve, stage.duration * 100))
}

async function executeContentAnalysisStage(supabase: any, stage: any, config: any) {
  switch (stage.id) {
    case 'data_collection':
      // Analyze existing content performance
      const { data: blogPosts } = await supabase
        .from('blog_posts')
        .select('*')
        .limit(10)
      
      const { data: recipes } = await supabase
        .from('recipes')
        .select('*')
        .limit(10)
      
      console.log(`Analyzed ${blogPosts?.length || 0} blog posts and ${recipes?.length || 0} recipes`)
      break
    default:
      await new Promise(resolve => setTimeout(resolve, stage.duration * 100))
  }
}
