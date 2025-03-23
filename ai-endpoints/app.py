from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware  # Add this import
from code_parser import CodeParser
from agent import generate_prediction
import sympy as sp

class CodeInput(BaseModel):
    code:str

class Question(BaseModel):
    question:str

code_parser = CodeParser()
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

@app.post("/parse")
async def parse_code(input: CodeInput):
    tree = code_parser.evaluate_code_syntax(input.code)
    return {"tree": str(tree.root_node)}

@app.post("/errors")
async def get_errors(input: CodeInput):
    tree = code_parser.evaluate_code_syntax(input.code)
    errors = code_parser.find_error_nodes(tree)
    if errors: 
        return {"errors":0}
    return {"errors":0}

@app.post("/time_complexity")
async def analyse_time_complexity(input: CodeInput):
    tree = code_parser.evaluate_code_syntax(input.code)
    time_complexity = code_parser.analyze_time_complexity(tree)
    return {"time_complexity": str(sp.simplify(time_complexity))}

@app.post("/memory_usage")
async def analyze_memory_usage(input: CodeInput):
    tree = code_parser.evaluate_code_syntax(input.code)
    memory_usage, _ = code_parser.analyze_memory_usage(tree.root_node)
    return {"memory_usage": str(sp.simplify(memory_usage))}

@app.post("/print_ast")
async def print_tree(input: CodeInput):
    tree = code_parser.evaluate_code_syntax(input.code)
    code_parser.print_tree(tree)
    return {"message": "tree printed to console"}

@app.post("/return_analysis")
async def print_info(input: CodeInput):
    """
    Returns time complexity, memory usage and syntax errors if any.
    """
    tree = code_parser.evaluate_code_syntax(input.code)
    errors = code_parser.find_error_nodes(tree.root_node)
    time_complexity = code_parser.analyze_time_complexity(tree.root_node)
    memory, _ = code_parser.analyze_memory_usage(tree.root_node)
    return {
        "Syntax Errors": errors,
        "Time Complexity": str(sp.simplify(time_complexity)),
        "Memory Usage": str(sp.simplify(memory))
    }

@app.post("/technical-qna")
async def generate_answer(question: Question):
    answer = generate_prediction(question.question)
    print(answer)
    return {"answer": answer}
