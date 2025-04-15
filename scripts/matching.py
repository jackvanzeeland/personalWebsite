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
    who_do_i_have = {}
    list_of_remaining_names = list_of_names.copy()
    status = "Bad"
    while status == "Bad":
        for name in list_of_names:
            #print(list_of_remaining_names)
            if len(list_of_remaining_names) > 0:
                rand_value = random.randint(0, len(list_of_remaining_names)-1)
                selected = list_of_remaining_names.pop(rand_value)
                if selected == name:
                    list_of_remaining_names.append(selected)
                    new_rand_value = len(list_of_remaining_names) - random.randint(0, len(list_of_remaining_names)-1)
                    selected = list_of_remaining_names.pop(rand_value)
                who_do_i_have[name] = selected

        for name in who_do_i_have:
            if name == who_do_i_have[name]:
                status = "Bad"
            else:
                status = "Good"
    log_text("Project.Matching - Retrieved matching")
    return who_do_i_have