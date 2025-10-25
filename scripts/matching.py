import random
from scripts.log import log_text

def secret_santa(list_of_names):
    log_text("Project.Matching - Retrieving secret santa matches")
    
    # Make a copy of the names to shuffle for recipients
    givers = list_of_names[:]
    receivers = list_of_names[:]
    
    # Shuffle both lists
    random.shuffle(givers)
    random.shuffle(receivers)
    
    # Ensure no one gives to themselves
    # This loop ensures that givers[i] != receivers[i]
    # If givers[i] == receivers[i], swap receivers[i] with the next receiver
    # If it's the last element, swap with the first receiver
    for i in range(len(givers)):
        if givers[i] == receivers[i]:
            # If it's the last element, swap with the first
            if i == len(givers) - 1:
                receivers[i], receivers[0] = receivers[0], receivers[i]
            else:
                # Otherwise, swap with the next element
                receivers[i], receivers[i+1] = receivers[i+1], receivers[i]
    
    # Create the assignments dictionary
    who_do_i_have = {}
    for i in range(len(givers)):
        who_do_i_have[givers[i]] = receivers[i]
        
    log_text("Project.Matching - Retrieved matching")
    return who_do_i_have