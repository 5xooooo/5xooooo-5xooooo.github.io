import pandas as pd
import os

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
    df_rainfall.to_csv('rainfall.csv', mode='a', header=True, index=False)
    df_wind_speed.to_csv('wind_speed.csv', mode='a', header=False, index=False)
    df_wind_direction.to_csv('wind_direction.csv', mode='a', header=False, index=False)

def main():
    directory = '2023_raw'
    for filename in os.listdir(directory):
        if filename.endswith('.csv'):
            file = load_data(os.path.join(directory, filename))
            preprocess_data(file, filename)

    directory = '2023'
    for filename in os.listdir(directory):
        if filename.endswith('.csv'):
            file = load_data(os.path.join(directory, filename))
            combine_data(file, filename)


if __name__ == '__main__':
    main()