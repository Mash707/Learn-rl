import os
import re

from huggingface_hub import InferenceClient
from dotenv import load_dotenv  

load_dotenv()
print("Environment Keys Loaded:", os.getenv('HUGGINGFACE_API_KEY'))

hf_api_key = os.getenv('HUGGINGFACE_API_KEY')
if not hf_api_key:
    raise ValueError("Hugging Face API Key not set in environment variable")

text_generation_client = InferenceClient(
    token=hf_api_key,
    model="mistralai/Mixtral-8x7B-Instruct-v0.1"
)

def format_prompt_for_model(user_prompt: str) -> str:
    """
    Format the user prompt and context data for the model.
    
    Args:
        user_prompt: The user's question or request
        context_data: Dictionary containing additional context information
    
    Returns:
        Formatted prompt string ready for the model
    """
    system_context_prompt = (
        "You are a technical expert specializing in C++ programming and documentation. "
        "Your role is to provide clear, detailed, concise and accurate answers to questions related to C++ code, "
        "libraries, best practices, and standards. Include code examples where applicable."
    )

    # context_str = "\n".join([f" - {key}: {value}" for key, value in context_data.items()])
    
    user_context_prompt = (
        f"User Question: {user_prompt}\n"
        "Please provide a comprehensive but concise technical answer."
    )

    combined_prompt = f"<s>[SYS] {system_context_prompt} [/SYS]\n[INST] {user_context_prompt} [/INST]"
    return combined_prompt

def generate_prediction(user_question: str) -> str:
    generation_parameters = dict(
        temperature=0.5,       # Controls randomness of generated text
        max_new_tokens=1024,   # Maximum number of tokens to generate
        top_p=0.96,           
        repetition_penalty=1.0,
        do_sample=True,
        seed=42,
    )

    model_ready_prompt = format_prompt_for_model(user_question)

    generated_text_stream = text_generation_client.text_generation(
        model_ready_prompt,
        **generation_parameters,
        stream=True,
        details=True,
        return_full_text=True,
    )

    final_output_text = ""
    for text_segment in generated_text_stream:
        final_output_text += text_segment.token.text

    # Use regex to filter out </s> tokens
    cleaned_output = re.sub(r'</s>', '', final_output_text)
    
    # Also remove the original prompt from the response if present
    # This looks for the [/INST] tag and takes everything after it
    match = re.search(r'\[/INST\](.*)', cleaned_output, re.DOTALL)
    if match:
        cleaned_output = match.group(1).strip()

    return cleaned_output

if __name__ == "__main__":
    sample_user_question = "How do I use hashmaps in cpp?"
    
    # context_data = {
    #     "Category": "Technical Documentation",
    #     "Reference": "Latest C++ standards and memory management techniques", 
    #     "Code_Analysis": "Memory usage concerns detected in large data structures"
    # }

    result = generate_prediction(sample_user_question)
    print("Generated Response:\n", result)