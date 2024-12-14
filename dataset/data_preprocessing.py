import pandas as pd
import os
import json

rainfall = {}
wind_speed = {}
wind_direction = {}

def load_data(filename):
    data = pd.read_csv(filename)
    return data

def preprocess_data(file, filename):
    df = pd.DataFrame(file)
    # print(df.head())
    df_filtered = df[df['測項'].isin(['WIND_DIREC', 'WIND_SPEED', 'RAINFALL'])]
    output_directory = '2023'
    if not os.path.exists(output_directory):
        os.makedirs(output_directory)
    output_path = os.path.join(output_directory, filename)
    df_filtered.to_csv(output_path, index=False)

def combine_data(file, filename):
    df = pd.DataFrame(file)
    df_rainfall = df[df['測項'] == 'RAINFALL']
    df_wind_speed = df[df['測項'] == 'WIND_SPEED']
    df_wind_direction = df[df['測項'] == 'WIND_DIREC']
    df_rainfall.to_csv('rainfall.csv', mode='w', header=True, index=False, encoding='utf-8-sig')
    df_wind_speed.to_csv('wind_speed.csv', mode='w', header=False, index=False, encoding='utf-8-sig')
    df_wind_direction.to_csv('wind_direction.csv', mode='w', header=False, index=False, encoding='utf-8-sig')

def site_to_city():
    file = load_data('sitename.csv')
    df = pd.DataFrame(file)
    address = {}
    for index, row in df.iterrows():
        address[row['sitename']] = row['sitename']
        address[row['sitename']] = str(row['siteaddress'])[:3]

    address_list = [{'sitename': row['sitename'], 'sitecity': str(row['siteaddress'])[:3]} for index, row in df.iterrows()]
    with open('address.json', 'w', encoding='utf-8') as json_file:
        json.dump(address_list, json_file, ensure_ascii=False, indent=4)
        

def main():
    # directory = '2023_raw'
    # for filename in os.listdir(directory):
    #     if filename.endswith('.csv'):
    #         file = load_data(os.path.join(directory, filename))
    #         preprocess_data(file, filename)

    # directory = '2023'
    # for filename in os.listdir(directory):
    #     if filename.endswith('.csv'):
    #         file = load_data(os.path.join(directory, filename))
    #         combine_data(file, filename)

    site_to_city()


if __name__ == '__main__':
    main()