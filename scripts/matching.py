import random
from scripts.log import log_text

def partner_generator(partnersCT, list_of_names):
    for i in range(random.randint(100,1000)):
        random.shuffle(list_of_names)
    if len(list_of_names)%partnersCT == 0:
        log_text("Partners are:")
        amount_of_groups = int(len(list_of_names)/partnersCT)
        groups = {}
        for i in range(amount_of_groups):
            for j in range(partnersCT):
                log_text(i)
                log_text(f"\t{list_of_names[partnersCT*i]} and {list_of_names[partnersCT*i+1]}")
    else:
        log_text("Odd number of players :(\n")
        unlucky_player = list_of_names[random.randint(0, len(list_of_names)- 1)]
        list_of_names.pop(list_of_names.index(unlucky_player))
        log_text(f"{unlucky_player} has to sit out \n")
        log_text("Partners are:")
        for i in range(int(len(list_of_names)/partnersCT)):
            log_text(f"\t{list_of_names[partnersCT*i]} and {list_of_names[partnersCT*i+1]}")
    log_text("Good Luck :)")


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