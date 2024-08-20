%% little script to demonstrate LAB polar conversion and gamut check
% John Maule = June 2024
close all
%% take a single random example RGB value
rgb = rand(1,3);
% convert to lab
lab = rgb2lab(rgb);
% convert to polar space on the a and b dimensions (ignore L)
[hue, chroma] = cart2pol(lab(:,2), lab(:,3));
% hue angles will be in radians so convert for interpretability
hue = rad2deg(hue); % equivalent to hue./(2*pi).*360

% make a graph to show the space
figure
subplot(1,2,1)
scatter(lab(2),lab(3),50,rgb,'filled')
xlim([-120 120])
ylim([-120 120])
xlabel('a*')
ylabel('b*')
axis square
hold on
plot(0,0,'+k')
% label axes by hue angle and Chroma
title(['Hue = ',num2str(hue,2),' degrees; Chroma = ',num2str(chroma,2)])

%% take some example RGB values - random
clear
rgb = [1 1 1] .* rand(100,3);
% convert to lab
lab = rgb2lab(rgb);
% convert to polar space on the a and b dimensions (ignore L)
[hue, chroma] = cart2pol(lab(:,2), lab(:,3));

% make a graph to show the space
subplot(1,2,2)
scatter(lab(:,2),lab(:,3),50,rgb,'filled')
xlim([-120 120])
ylim([-120 120])
xlabel('a*')
ylabel('b*')
axis square
hold on
plot(0,0,'+k')

%% work out where LAB transgresses the sRGB gamut
% example - here's a lab value which will be outside the RGB gamut
Lstar = 50; % Lstar will affect the gamut
lab1 = [Lstar -100 -100];
rgb1 = lab2rgb(lab1) % this rgb value contains values >1 and <0, indicating it is out of gamut

lab2 = [Lstar -10 -10];
rgb2 = lab2rgb(lab2) % whereas this one is in gamut

% polar example - convert from hue angle/chroma to lab, then rgb
hue = 90; % deg
chroma = 15;
lab(1) = Lstar;
[lab(2),lab(3)] = pol2cart(deg2rad(hue),chroma);
rgb = lab2rgb(lab);

%%
% this means we can iterate over hue angles at different chroma levels to
% see where the gamut provides a complete circle
clear
Lstar = 50;
hues = 0:.1:360;
chromas = 5:2.5:150;
lab = NaN(length(hues),3);
figure
subplot(1,2,1)
for c = 1:length(chromas)
    chroma = chromas(c);
    lab(:,1) = Lstar;
    [lab(:,2),lab(:,3)] = pol2cart(deg2rad(hues),chroma);
    rgb = lab2rgb(lab);

    %check and record out of gamut colours
    OOGlog(c) = any(any(rgb>1,2)) | any(any(rgb<0,2));
    %set them black
    rgb(any(rgb>1,2),:) = 0;
    rgb(any(rgb<0,2),:) = 0;


    % create a figure which will visualise the RGB gamut at this L*
    scatter(lab(:,2),lab(:,3),50,rgb,'filled')
    xlim([-150 150])
    ylim([-150 150])
    hold on
    clear rgb
end
title(['L* = ',num2str(Lstar)])

% find highest chroma with no out of gamut hues
maxChroma = chromas(max(find(~OOGlog)));

% render and plot the max in gamut circle
clear lab
lab = NaN(length(hues),3);
lab(:,1) = Lstar;
[lab(:,2),lab(:,3)] = pol2cart(deg2rad(hues),maxChroma);
rgb = lab2rgb(lab);

%check and record out of gamut colours
OOGs = any(any(rgb>1,2)) | any(any(rgb<0,2))
%set them black
rgb(any(rgb>1,2),:) = 0;
rgb(any(rgb<0,2),:) = 0;


plot(lab(:,2),lab(:,3),'.k')
subplot(1,2,2)
scatter(lab(:,2),lab(:,3),50,rgb,'filled')
xlim([-150 150])
ylim([-150 150])
title(['L* = ',num2str(Lstar),' max Chroma = ',num2str(maxChroma)])